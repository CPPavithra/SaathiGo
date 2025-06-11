// server.js - Node.js + Socket.IO Backend (ES Modules)

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your React app URL
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage (use Redis or MongoDB in production for persistence)
let activeRideRequests = new Map(); // Stores active ride requests by socket.id
let userSockets = new Map(); // Stores active socket objects by socket.id

// Haversine formula for distance calculation in kilometers
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Find matching riders for a given request
const findMatches = (newRequest) => {
  const matches = [];

  for (let [requestId, request] of activeRideRequests) {
    // Exclude the current request from its own matches
    if (requestId === newRequest.id) continue;
    // Only consider requests that are still 'searching'
    if (request.status !== 'searching') continue;

    // Check proximity (within 1km for both pickup and drop)
    const pickupDistance = calculateDistance(
      newRequest.pickupCoords[0], newRequest.pickupCoords[1],
      request.pickupCoords[0], request.pickupCoords[1]
    );

    const dropDistance = calculateDistance(
      newRequest.dropCoords[0], newRequest.dropCoords[1],
      request.dropCoords[0], request.dropCoords[1]
    );

    // Check timing (within 10 minutes, 600000 milliseconds)
    const timeDifference = Math.abs(newRequest.timestamp - request.timestamp);
    const withinTimeLimit = timeDifference <= 600000;

    // Check preferences compatibility:
    // 1. If newRequest requires womenOnly, the existing request must also be womenOnly.
    // 2. Luggage preference must match.
    const preferencesMatch =
      (!newRequest.womenOnly || request.womenOnly) &&
      (newRequest.luggage === request.luggage);

    // If all conditions are met, it's a match
    if (pickupDistance <= 1 && dropDistance <= 1 && withinTimeLimit && preferencesMatch) {
      matches.push({
        ...request,
        pickupDistance: pickupDistance.toFixed(2), // Format to 2 decimal places
        dropDistance: dropDistance.toFixed(2)      // Format to 2 decimal places
      });
    }
  }

  // Sort matches by pickup distance for better relevance
  return matches.sort((a, b) => parseFloat(a.pickupDistance) - parseFloat(b.pickupDistance));
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User submits a ride request
  socket.on('submit_ride_request', (requestData) => {
    // Create a comprehensive ride request object
    const rideRequest = {
      ...requestData,
      id: socket.id, // Use socket.id as the unique request ID
      socketId: socket.id, // Store socket.id for direct communication
      timestamp: Date.now(), // Record the time of the request
      status: 'searching' // Initial status
    };

    // Store the request and the socket object
    activeRideRequests.set(socket.id, rideRequest);
    userSockets.set(socket.id, socket);

    console.log('New ride request:', rideRequest);

    // Find immediate matches for this new request
    const matches = findMatches(rideRequest);

    // Send the found matches to the requesting user
    socket.emit('matches_found', matches);

    // Notify existing users about this new potential match:
    // Iterate through all active requests
    for (let [existingRequestId, existingRequest] of activeRideRequests) {
      // If it's not the new request and the existing request is still searching
      if (existingRequestId !== socket.id && existingRequest.status === 'searching') {
        // Recalculate matches for the existing user (as a new request might have appeared)
        const matchesForExisting = findMatches(existingRequest);
        const existingSocket = userSockets.get(existingRequestId);

        // If the existing user's socket is still active, send them updated matches
        if (existingSocket) {
          existingSocket.emit('matches_updated', matchesForExisting);
        }
      }
    }
  });

  // User requests to connect with another rider
  socket.on('request_ride_share', ({ targetUserId, message }) => {
    const targetSocket = userSockets.get(targetUserId); // Get target user's socket
    const requesterData = activeRideRequests.get(socket.id); // Get requester's data

    // If both target socket and requester data exist
    if (targetSocket && requesterData) {
      console.log(`Ride share request from ${requesterData.userName} (${socket.id}) to ${targetUserId}`);
      // Emit 'ride_share_request' to the target user
      targetSocket.emit('ride_share_request', {
        from: requesterData, // Send requester's full data
        message: message || `${requesterData.userName} wants to share a ride with you!` // Custom or default message
      });
    } else {
      console.log(`Failed request_ride_share: targetSocket or requesterData not found.`);
    }
  });

  // User accepts a ride share request
  socket.on('accept_ride_share', ({ fromUserId }) => {
    const fromSocket = userSockets.get(fromUserId); // Socket of the user who made the initial request
    const accepterData = activeRideRequests.get(socket.id); // Data of the user who accepted

    if (fromSocket && accepterData) {
      console.log(`${accepterData.userName} (${socket.id}) accepted ride from ${fromUserId}`);

      const requesterData = activeRideRequests.get(fromUserId); // Data of the user who made the initial request

      // Set status to 'matched' for both users
      if (requesterData) requesterData.status = 'matched';
      accepterData.status = 'matched';

      // Notify both users that the ride share has been accepted
      if (requesterData) {
         fromSocket.emit('ride_share_accepted', { matchedWith: accepterData });
      }
      socket.emit('ride_share_accepted', { matchedWith: requesterData });

      // Remove both users from active ride requests as they are now matched
      activeRideRequests.delete(fromUserId);
      activeRideRequests.delete(socket.id);
      userSockets.delete(fromUserId);
      userSockets.delete(socket.id);


      // Broadcast updated matches to any remaining searching users
      broadcastUpdatedMatches();
    } else {
      console.log(`Failed accept_ride_share: fromSocket or accepterData not found.`);
    }
  });

  // User declines a ride share request
  socket.on('decline_ride_share', ({ fromUserId }) => {
    const fromSocket = userSockets.get(fromUserId); // Get socket of the user who made the request
    if (fromSocket) {
      console.log(`${socket.id} declined ride from ${fromUserId}`);
      fromSocket.emit('ride_share_declined'); // Notify the requester of the decline
    } else {
      console.log(`Failed decline_ride_share: fromSocket not found.`);
    }
  });

  // User cancels their own ride request
  socket.on('cancel_ride_request', () => {
    console.log(`User ${socket.id} cancelled their ride request.`);
    activeRideRequests.delete(socket.id); // Remove the request
    userSockets.delete(socket.id); // Remove the socket reference
    broadcastUpdatedMatches(); // Update matches for others
  });

  // Handle socket disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    activeRideRequests.delete(socket.id); // Remove request if user disconnects
    userSockets.delete(socket.id); // Remove socket reference
    broadcastUpdatedMatches(); // Update matches for others
  });
});

// Function to broadcast updated matches to all currently searching users
const broadcastUpdatedMatches = () => {
  for (let [requestId, request] of activeRideRequests) {
    if (request.status === 'searching') { // Only update for users still searching
      const matches = findMatches(request);
      const socket = userSockets.get(requestId);
      if (socket) {
        socket.emit('matches_updated', matches);
      }
    }
  }
};

// API endpoint to get current active requests (for debugging/monitoring)
app.get('/api/active-requests', (req, res) => {
  const requests = Array.from(activeRideRequests.values()).map(req => ({
    ...req,
    socketId: undefined // Don't expose sensitive socket IDs in API response
  }));
  res.json(requests);
});

const PORT = process.env.PORT || 5100; // Use port 5100
server.listen(PORT, () => {
  console.log(`SaathiGo Backend Server running on port ${PORT}`);
});

// Exporting for potential testing or modularization (optional in a direct run script)
// Note: In ES Modules, you'd use 'export { app, server, io };' if this were a module.
// For a direct run, this line can be omitted or adapted if you intended to import
// these variables into another file for testing.
// For this context, assuming it's a standalone server.
// module.exports = { app, server, io }; // This CommonJS export is not needed for ESM.
