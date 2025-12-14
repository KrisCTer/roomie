// utils/participantHelpers.js
// Helper functions for handling participant logic

/**
 * Extract user ID from participant object
 * Handles multiple possible field names
 */
export const getParticipantId = (participant) => {
  if (!participant) return null;
  return participant.userId || participant.id || participant.sub || null;
};

/**
 * Find remote peer (the OTHER person in conversation)
 * @param {Array} participants - List of participants
 * @param {string} currentUserId - Current user's ID
 * @returns {Object|null} Remote peer or null
 */
export const findRemotePeer = (participants, currentUserId) => {
  if (!participants || !Array.isArray(participants)) {
    console.error("❌ Invalid participants array:", participants);
    return null;
  }

  if (!currentUserId) {
    console.error("❌ No current user ID provided");
    return null;
  }

  console.log("🔍 Finding remote peer:");
  console.log("   My ID:", currentUserId);
  console.log("   Total participants:", participants.length);

  // Find participant that is NOT me
  const remotePeer = participants.find((p) => {
    const participantId = getParticipantId(p);
    const isNotMe = participantId && participantId !== currentUserId;
    
    console.log(`   Checking: ${participantId} -> ${isNotMe ? '✅ Remote peer' : '❌ That\'s me'}`);
    
    return isNotMe;
  });

  if (!remotePeer) {
    console.error("❌ Could not find remote peer!");
    console.error("   Current user ID:", currentUserId);
    console.error("   All participants:", participants);
  } else {
    console.log("✅ Found remote peer:", remotePeer);
  }

  return remotePeer || null;
};

/**
 * Check if participant is current user
 */
export const isCurrentUser = (participant, currentUserId) => {
  const participantId = getParticipantId(participant);
  return participantId === currentUserId;
};

/**
 * Get display name from participant
 */
export const getParticipantDisplayName = (participant) => {
  if (!participant) return "Unknown User";
  
  if (participant.fullName) return participant.fullName;
  
  if (participant.firstName && participant.lastName) {
    return `${participant.firstName} ${participant.lastName}`;
  }
  
  if (participant.firstName) return participant.firstName;
  if (participant.username) return participant.username;
  if (participant.email) return participant.email;
  
  return "Unknown User";
};