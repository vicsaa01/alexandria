import * as rs from 'jsrsasign';

export class JSONWebToken {
    jwtKey = 'dDlQOYga1SGvBPfD';

    verifySession(): boolean {
        // session verification logic
        return true;
    }

    createToken(expSeconds: number): string {
        const header = JSON.stringify({typ: 'JWT'});
        const payload = JSON.stringify({
          username: localStorage.getItem('userID'), // if session token verified
          exp: Math.floor(Date.now()/1000) + expSeconds
        });
        const sJWT = rs.KJUR.jws.JWS.sign('HS256', header, payload, this.jwtKey);
        return sJWT;
    }
}