
//   // Your web app's Firebase configuration
//   const firebaseConfig = {
//     apiKey: "AIzaSyAiUpK-r_z4wlGN4asKiyQXtutipf7kr1Y",
//     authDomain: "bloodlist-38979.firebaseapp.com",
//     projectId: "bloodlist-38979",
//     storageBucket: "bloodlist-38979.appspot.com",
//     messagingSenderId: "697182918191",
//     appId: "1:697182918191:web:bfb3339590fec0af2f58da"
//   };



 
// // // Initialize xd
// firebase.initializeApp(firebaseConfig);

// var db = firebase.firestore();
// var ref = db.collection('tako');

// var dataBox = {}
// ref.get().then(querySnapshot => {
//   querySnapshot.forEach(doc => {
//     console.log(doc.id, doc.data());
//     dataBox = doc.data()
//     console.log([dataBox.name,dataBox.type])
//   });
// });