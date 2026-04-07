export const handler = async (event, context) => {
    const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
    const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

    try {
        const authRes = await fetch(
            `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
            { method: "POST" },
        );
        const { access_token } = await authRes.json();

        const igdbRes = await fetch("https://api.igdb.com/v4/events", {
            method: "POST",
            headers: {
                "Client-ID": CLIENT_ID,
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "text/plain",
            },
            body: "fields name, description, start_time, event_logo.url; sort start_time asc; limit 10;",
        });

        const data = await igdbRes.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error) {
        return { statusCode: 500, body: error.toString() };
    }
};
