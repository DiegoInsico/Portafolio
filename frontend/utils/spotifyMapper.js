// utils/spotifyMapper.js

export const mapSpotifyTrackToFirestore = (track) => {
    return {
        id: track.id,
        name: track.name,
        artist: track.artists.map((artist) => artist.name).join(', '),
        albumImage: track.album.images[0]?.url || null,
        // Puedes agregar más campos si lo deseas
    };
};

export const mapSpotifyResponseToFirestore = (spotifyResponse) => {
    if (
        spotifyResponse &&
        spotifyResponse.tracks &&
        Array.isArray(spotifyResponse.tracks.items)
    ) {
        return spotifyResponse.tracks.items.map(mapSpotifyTrackToFirestore);
    }
    return [];
};
