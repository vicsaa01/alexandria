import * as rs from 'jsrsasign';
import { environment } from './environments/environment';

export class JSONWebToken {
    httpUrl: string = "http://localhost:5000"; // only for development
    httpsUrl: string | undefined = environment.prodUrl;
    jwtKey: string | undefined = environment.jwtKey;

    async validateSession(sessionToken: string, userID: string): Promise<boolean> {
        try {
            const res = await fetch(this.httpsUrl + '/validate-session', {
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
            userID: userID,
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
                    userID: userID,
                    exp: Math.floor(Date.now()/1000) + expSeconds
                });
                const sJWT = rs.KJUR.jws.JWS.sign('HS256', header, payload, this.jwtKey);
                return sJWT;
            } else {
                // If invalid session, return error message
                console.log("Session is invalid. Session has not been validated.");
                return "Invalid session";
            }
        } else {
            // If invalid session, return error message
            console.log("Session is invalid. No session detected.");
            return "Invalid session";
        }
    }
}