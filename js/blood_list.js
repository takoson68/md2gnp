

var mdBoxApp = new Vue({
  el: "#app",
  data: {
    allName: [],
    name: 'pData',
    dataBox: {
      // "id": "",
      // "name": "",
      // "list": [{
      //   "time": {
      //     "seconds": null,
      //     "nanoseconds": null
      //   },
      //   "heartbeat": null,
      //   "low": null,
      //   "high": null
      // }]
    },
    newData: [],
    firebaseConfig: {
      apiKey: "AIzaSyAiUpK-r_z4wlGN4asKiyQXtutipf7kr1Y",
      authDomain: "bloodlist-38979.firebaseapp.com",
      projectId: "bloodlist-38979",
      storageBucket: "bloodlist-38979.appspot.com",
      messagingSenderId: "697182918191",
      appId: "1:697182918191:web:bfb3339590fec0af2f58da"
    }
  },
  created: function () {
    this.getDataBox()
    this.getAllName()
  },
  watch: {
 
  },
  computed: {
    db(){
      firebase.initializeApp(this.firebaseConfig);
      return firebase.firestore();
    },
    ref(){
      return this.db.collection('blood').doc(this.name);
    }
  },
  mounted() {
    // this.$forceUpdate()
  },
  methods: {
    getAllName(){
      let ref = this.db.collection('blood');
      ref.get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
          // console.log(doc.id, doc.data());
          this.allName = [...this.allName,doc.id]
        });
      });
    },
    goThis(name){
      this.name = name 
      this.getDataBox()
    },
    getDataBox() {
      console.log(this.name);
      this.ref.get().then(doc => {
        console.log(doc.data());
        this.dataBox = doc.data()
        // querySnapshot.forEach(doc => {
        //   this.dataBox = doc.data()
        //   // console.log(doc.id, this.dataBox);
        //   // console.log(this.dataBox.people[0].list[0].time)
        //   // console.log(new Date(this.dataBox.people[0].list[0].time.seconds*1000));
        // });
      });

    },
    updateData(){
      let dd = {
          "name": "林小頭",
          'id': 'pData',
          "list": [{
            "time": {
              "seconds": 1645545600,
              "nanoseconds": 0
            },
            "heartbeat": 65,
            "low": 88,
            "high": 125
          },{
            "time": {
              "seconds": 1645545600,
              "nanoseconds": 0
            },
            "heartbeat": 55,
            "low": 98,
            "high": 115
          }]
        }
      this.ref.update(dd).then(() => {
        console.log('add data successful');
        this.getDataBox()
      });
    },
    addNewName(){
      let ss = {
        "name": "測試頭",
        'id': 'test2',
        "list": [{
          "time": {
            "seconds": 1645545600,
            "nanoseconds": 0
          },
          "heartbeat": 66,
          "low": 11,
          "high": 165
        }]
      }
      let ref = this.db.collection('blood').doc('test2')
      ref.set(ss).then(() => {
        console.log('set data successful');
        this.allName = []
        this.getAllName()
      });
    },
    deleteName(){
      let ref = this.db.collection('blood').doc('test2')
      ref.delete().then(() => {
        console.log('delete data successful');
        this.allName = []
        this.getAllName()
      });
    },
  },
});

 