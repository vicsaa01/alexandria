export class Client {
    httpUrl: string = 'http://127.0.0.1:5000';
    httpsUrl: string = 'http://127.0.0.1:5000'; // use http while in development

    async httpsGet(subroute: string): Promise<any> {
        fetch(this.httpsUrl + subroute)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                console.log('Error: ' + data.error);
                return;
            }
            return data;
        })
        .catch(error => {
            console.log('Error: ' + error.message);
        })
    }

    async httpsPost(subroute: string, object: any): Promise<any> {
        fetch(this.httpsUrl + subroute, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(object)
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                console.log('Error: ' + data.error);
                return;
            }
            return data;
        })
        .catch(error => {
            console.log('Error: ' + error.message);
        })
    }
}