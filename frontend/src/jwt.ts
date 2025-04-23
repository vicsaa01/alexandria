import * as rs from 'jsrsasign';
// import { Client } from './client';

export class JSONWebToken {
    jwtKey = 'dDlQOYga1SGvBPfD';

    // constructor(private client: Client) {}

    async validateSession(sessionToken: string, userID: string): Promise<boolean> {
        try {
            const res = await fetch('https://127.0.0.1:5000/validate-session', { // use Client class
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({
                    sessionToken: sessionToken,
                    userID: userID
                })
            })
            const data = await res.json();
            return data.isValid || false;
        }
        catch (error) {
            console.log('Session validation error: ' + error);
            return false;
        }
    }

    createToken(expSeconds: number): string {
        const userID = localStorage.getItem('userID');
        const header = JSON.stringify({typ: 'JWT'});
        const payload = JSON.stringify({
            username: userID,
            exp: Math.floor(Date.now()/1000) + expSeconds
        });
        const sJWT = rs.KJUR.jws.JWS.sign('HS256', header, payload, this.jwtKey);
        return sJWT;
    }

    async createValidatedToken(expSeconds: number): Promise<string> {
        // Get cookies
        const sessionToken = localStorage.getItem('sessionToken');
        const userID = localStorage.getItem('userID');

        // Validate session
        if (sessionToken !== null && userID !== null) {
            const isValid: boolean = await this.validateSession(sessionToken, userID);
            if (isValid) {
                // If valid session, return token
                const header = JSON.stringify({typ: 'JWT'});
                const payload = JSON.stringify({
                    username: userID,
                    exp: Math.floor(Date.now()/1000) + expSeconds
                });
                const sJWT = rs.KJUR.jws.JWS.sign('HS256', header, payload, this.jwtKey);
                return sJWT;
            } else {
                // If invalid session, return error message
                return "Invalid session";
            }
        } else {
            // If invalid session, return error message
            return "Invalid session";
        }
    }
}