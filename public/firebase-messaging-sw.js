importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);
// // Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
};

try {
  const canInitialize =
    Boolean(firebaseConfig?.apiKey) && Boolean(firebaseConfig?.messagingSenderId);

  if (canInitialize && typeof firebase !== "undefined") {
    firebase.initializeApp(firebaseConfig);

    const messaging = firebase.messaging();
    messaging.onBackgroundMessage(function (payload) {
      const notificationTitle = payload?.notification?.title;
      const notificationOptions = {
        body: payload?.notification?.body,
      };

      if (notificationTitle) {
        self.registration.showNotification(notificationTitle, notificationOptions);
      }
    });
  }
} catch (e) {
  // Avoid breaking the app if FCM isn't configured.
}
