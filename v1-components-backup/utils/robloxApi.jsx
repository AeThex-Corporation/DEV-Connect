/**
 * Roblox API utilities for fetching user and game data
 */

const ROBLOX_API_BASE = 'https://apis.roblox.com';
const ROBLOX_USERS_API = 'https://users.roblox.com';
const ROBLOX_GAMES_API = 'https://games.roblox.com';
const ROBLOX_THUMBNAILS_API = 'https://thumbnails.roblox.com';

/**
 * Get user ID from username
 */
export async function getUserIdFromUsername(username) {
  try {
    const response = await fetch(`${ROBLOX_USERS_API}/v1/usernames/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: true
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user ID');
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      return data.data[0].id;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user ID:', error);
    return null;
  }
}

/**
 * Get user profile information
 */
export async function getUserProfile(userId) {
  try {
    const response = await fetch(`${ROBLOX_USERS_API}/v1/users/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Get user's avatar headshot
 */
export async function getUserAvatar(userId) {
  try {
    const response = await fetch(
      `${ROBLOX_THUMBNAILS_API}/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch avatar');
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      return data.data[0].imageUrl;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return null;
  }
}

/**
 * Get game thumbnails from Roblox Thumbnails API
 * Returns a map of universeId -> imageUrl
 */
export async function getGameThumbnails(universeIds) {
  if (!universeIds || universeIds.length === 0) return {};
  
  try {
    const batchSize = 100;
    const thumbnailMap = {};
    
    for (let i = 0; i < universeIds.length; i += batchSize) {
      const batch = universeIds.slice(i, i + batchSize);
      const universeIdsParam = batch.join(',');
      
      console.log('Fetching thumbnails for universe IDs:', universeIdsParam);
      
      const response = await fetch(
        `${ROBLOX_THUMBNAILS_API}/v1/games/icons?universeIds=${universeIdsParam}&returnPolicy=PlaceHolder&size=512x512&format=Png&isCircular=false`
      );
      
      if (!response.ok) {
        console.error('Failed to fetch thumbnails batch:', response.status);
        continue;
      }

      const data = await response.json();
      console.log('Thumbnail API response:', data);
      
      if (data.data) {
        data.data.forEach(item => {
          if (item.imageUrl && item.state === 'Completed') {
            thumbnailMap[item.targetId] = item.imageUrl;
          }
        });
      }
    }
    
    console.log('Thumbnail map:', thumbnailMap);
    return thumbnailMap;
  } catch (error) {
    console.error('Error fetching game thumbnails:', error);
    return {};
  }
}

/**
 * Get games created by user with thumbnails
 */
export async function getUserGames(userId) {
  try {
    console.log('Fetching games for user:', userId);
    
    // Get the user's creations (games)
    const response = await fetch(
      `${ROBLOX_GAMES_API}/v2/users/${userId}/games?accessFilter=2&limit=50&sortOrder=Asc`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch user games');
    }

    const data = await response.json();
    console.log('Games API response:', data);
    
    if (!data.data || data.data.length === 0) {
      return [];
    }

    // Get universe IDs for thumbnail fetching
    const universeIds = data.data.map(game => game.id);
    console.log('Universe IDs:', universeIds);
    
    // Fetch thumbnails for all games at once
    const thumbnails = await getGameThumbnails(universeIds);
    console.log('Got thumbnails:', thumbnails);
    
    // Combine game data with thumbnails
    const games = data.data.map(game => {
      const thumbnail = thumbnails[game.id];
      console.log(`Game ${game.name} (${game.id}): thumbnail = ${thumbnail}`);
      
      return {
        id: game.id,
        rootPlaceId: game.rootPlaceId,
        title: game.name,
        description: game.description || '',
        game_url: `https://www.roblox.com/games/${game.rootPlaceId}`,
        thumbnail_url: thumbnail || null,
        created: game.created,
        updated: game.updated,
        visits: game.placeVisits || 0,
        likes: game.likes || 0,
        favorites: game.favoritedCount || 0,
        playing: game.playing || 0,
        maxPlayers: game.maxPlayers || 0,
        genre: game.genre || 'All',
        creator: {
          id: game.creator?.id,
          name: game.creator?.name,
          type: game.creator?.type
        }
      };
    });

    console.log('Final games with thumbnails:', games);
    return games;
  } catch (error) {
    console.error('Error fetching user games:', error);
    return [];
  }
}

/**
 * Get detailed game stats by place ID
 */
export async function getGameStats(placeId) {
  try {
    // Get universe ID from place ID first
    const universeResponse = await fetch(
      `${ROBLOX_API_BASE}/universes/v1/places/${placeId}/universe`
    );
    
    if (!universeResponse.ok) {
      throw new Error('Failed to fetch universe data');
    }

    const universeData = await universeResponse.json();
    const universeId = universeData.universeId;

    // Get detailed game info
    const gameResponse = await fetch(
      `${ROBLOX_GAMES_API}/v1/games?universeIds=${universeId}`
    );
    
    if (!gameResponse.ok) {
      throw new Error('Failed to fetch game stats');
    }

    const gameData = await gameResponse.json();
    
    if (gameData.data && gameData.data.length > 0) {
      const game = gameData.data[0];
      
      // Get voting/likes data
      const votesResponse = await fetch(
        `${ROBLOX_GAMES_API}/v1/games/votes?universeIds=${universeId}`
      );
      
      let likes = 0;
      if (votesResponse.ok) {
        const votesData = await votesResponse.json();
        if (votesData.data && votesData.data.length > 0) {
          const votes = votesData.data[0];
          likes = votes.upVotes || 0;
        }
      }

      return {
        visits: game.visits || 0,
        likes: likes,
        favorites: game.favoritedCount || 0,
        playing: game.playing || 0,
        maxPlayers: game.maxPlayers || 0
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching game stats:', error);
    return null;
  }
}

/**
 * Verify Roblox profile and return comprehensive data
 */
export async function verifyRobloxProfile(username) {
  try {
    const userId = await getUserIdFromUsername(username);
    
    if (!userId) {
      return {
        success: false,
        verified: false,
        error: 'User not found'
      };
    }

    const profile = await getUserProfile(userId);
    
    if (!profile) {
      return {
        success: false,
        verified: false,
        error: 'Failed to load profile'
      };
    }

    const avatarUrl = await getUserAvatar(userId);

    return {
      success: true,
      verified: true,
      data: {
        user_id: userId,
        username: profile.name,
        display_name: profile.displayName,
        description: profile.description,
        created: profile.created,
        is_banned: profile.isBanned,
        avatar_url: avatarUrl,
        profile_url: `https://www.roblox.com/users/${userId}/profile`,
        badges_count: 0,
        friends_count: 0
      }
    };
  } catch (error) {
    console.error('Error verifying Roblox profile:', error);
    return {
      success: false,
      verified: false,
      error: error.message || 'Verification failed'
    };
  }
}

/**
 * Fetch user games for portfolio import
 */
export async function fetchUserGames(username) {
  try {
    const userId = await getUserIdFromUsername(username);
    
    if (!userId) {
      return {
        success: false,
        games: [],
        error: 'User not found'
      };
    }

    const games = await getUserGames(userId);

    return {
      success: true,
      games: games,
      count: games.length
    };
  } catch (error) {
    console.error('Error fetching user games:', error);
    return {
      success: false,
      games: [],
      error: error.message || 'Failed to fetch games'
    };
  }
}

/**
 * Fetch game stats from Roblox game link
 */
export async function fetchGameStats(gameLink) {
  try {
    let placeId = null;
    
    const gamesMatch = gameLink.match(/roblox\.com\/games\/(\d+)/);
    if (gamesMatch) {
      placeId = gamesMatch[1];
    }
    
    if (!placeId) {
      return {
        success: false,
        error: 'Invalid Roblox game URL'
      };
    }

    const stats = await getGameStats(placeId);
    
    if (!stats) {
      return {
        success: false,
        error: 'Failed to fetch game stats'
      };
    }

    // Get universe ID and thumbnail
    const universeResponse = await fetch(
      `${ROBLOX_API_BASE}/universes/v1/places/${placeId}/universe`
    );
    
    let thumbnailUrl = null;
    let title = null;
    let description = null;
    
    if (universeResponse.ok) {
      const universeData = await universeResponse.json();
      const universeId = universeData.universeId;
      
      // Get game details
      const gameResponse = await fetch(
        `${ROBLOX_GAMES_API}/v1/games?universeIds=${universeId}`
      );
      
      if (gameResponse.ok) {
        const gameData = await gameResponse.json();
        if (gameData.data && gameData.data.length > 0) {
          const game = gameData.data[0];
          title = game.name;
          description = game.description;
        }
      }
      
      // Get thumbnail
      const thumbnails = await getGameThumbnails([universeId]);
      thumbnailUrl = thumbnails[universeId];
    }

    return {
      success: true,
      data: {
        ...stats,
        thumbnail_url: thumbnailUrl,
        title: title,
        description: description
      }
    };
  } catch (error) {
    console.error('Error fetching game stats:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch game stats'
    };
  }
}

/**
 * Format large numbers for display
 */
export function formatRobloxNumber(num) {
  if (!num || num === 0) return '0';
  
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString();
}