const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().functions);

var newData;
var newUpdate;

// Sends notification to drivers after client requests a ride
exports.rideRequest =
    functions.firestore.document('Request/{requestId}').onWrite(async (snapshot, context) => {
        if (snapshot.empty) {
            console.log('No Request');
            return;
        }
        var topic = 'Ride';
        newData = snapshot.after.data();
        if (newData.status === 1) {
            console.log('Just an Update from the Driver');
            return;
        }
    // Data to be sent in the fcm
        var payload = {
            notification: { title: 'Ride Request', body: 'Client is Awaiting', sound: 'default', priority: "high", },
            data: {
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
                message: newData.location,
                head: "Pick Me Up",
                name: newData.client,
                document: newData.token,
                documentID: newData.documentID,
                currentcord: newData.coordinate,
                image: newData.dp,
                hLoc: newData.headedname,
                hcord: newData.headedcoord,
                hlocdis: newData.headedlocdistance,
            },
        };
        try {
            const response = await admin.messaging().sendToTopic(topic, payload);
            console.log('Notification Sent Succesfully');
        } catch (err) {
            console.log('Error Sending Notifications: ' + err);
        }
    });

// Sends notification to client after driver responds to request
exports.rideResponse =
    functions.firestore.document('Response/{requestId}').onWrite(async (snapshot, context) => {
        if (snapshot.empty) {
            console.log('No Request Update');
            return;
        }
        newUpdate = snapshot.after.data();
        var tokenId = newUpdate.token;
    // Data to be sent in the fcm
        var payload = {
            notification: { title: 'Driver Response', body: 'On My Way', sound: 'default', priority: "high", },
            data: { click_action: 'FLUTTER_NOTIFICATION_CLICK', head: "Hey Am on my Way", name: newUpdate.driver, photo: newUpdate.photo },
        };
        try {
            const driverResponse = await admin.messaging().sendToDevice(tokenId, payload);
            console.log('Response Notification Sent Succesfully');
        } catch (er) {
            console.log('Error Sending Response Notification: ' + er);
        }
    });

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
