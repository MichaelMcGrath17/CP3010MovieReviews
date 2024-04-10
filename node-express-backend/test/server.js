
import {expect} from 'chai';
import request from 'request';

describe("POST /api/addInfo", () => {
    it("should return status of 200", (done) => {
        request.post({
            url: 'http://localhost:8000/api/addInfo', // Specify the URL directly
            json: true,
            body: {
                    "name": "Jim",
                    "movie": "Joe Dirt",
                    "email": "Jinx@gmail.com"
            }
        }, (error, response) => {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });
});