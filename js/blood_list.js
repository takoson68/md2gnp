

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
    pickMe: 1,
    newData: {
      heartbeat: 0,
      low: 0,
      high: 0
    },
    firebaseConfig: {
      apiKey: "AIzaSyAiUpK-r_z4wlGN4asKiyQXtutipf7kr1Y",
      authDomain: "bloodlist-38979.firebaseapp.com",
      projectId: "bloodlist-38979",
      storageBucket: "bloodlist-38979.appspot.com",
      messagingSenderId: "697182918191",
      appId: "1:697182918191:web:bfb3339590fec0af2f58da"
    },
    openAddBox: false,
    keyboardBox: ['1','2','3','4','5','6','7','8','9','<','0','enter'],
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
        this.dataBox.list.sort((x,y) => y.time.seconds - x.time.seconds);
        console.log(this.dataBox.list);
        // querySnapshot.forEach(doc => {
        //   this.dataBox = doc.data()
        //   // console.log(doc.id, this.dataBox);
        //   // console.log(this.dataBox.people[0].list[0].time)
        //   // console.log(new Date(this.dataBox.people[0].list[0].time.seconds*1000));
        // });
      });

    },
    addList(){
      this.dataBox.list = [{
          time: new Date(),
          heartbeat: 33,
          low: 88,
          high: 123
        },...this.dataBox.list]
        this.updateData()
    },
    delList(j){
      this.dataBox.list.splice(j, 1);
      this.updateData()
    },
    updateData(){
      let dd = this.dataBox
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
    convertTime(time){
      // console.log(new Date(time*1000).toLocaleString());
      // let DD = {
      //   y: new Date(time*1000).getFullYear(),
      //   m: (new Date(time*1000).getMonth()*1)+1,
      //   d: new Date(time*1000).getDate(),
      //   t: new Date(time*1000).getHours(),
      // }
      // return DD
      return new Date(time*1000).toLocaleString()
    },
    openAddListBox(){
      this.pickMe = 1
      this.openAddBox = true
    },
    cloMe(){
      this.pickMe = 1
      this.openAddBox = false
      this.newData = {
        heartbeat: 0,
        low: 0,
        high: 0
      }
    },
    pickMeBox(e){
      this.pickMe = e
    },
    addNumber(ele){
      console.log(ele);
      if(ele=='enter'){
        this.newData.time= new Date()
        console.log(this.newData);
        this.dataBox.list = [...this.dataBox.list,this.newData]
        this.updateData()
        this.openAddBox = false
        this.newData = {
          heartbeat: 0,
          low: 0,
          high: 0
        }
      }

      let dd = this.pickMe==1?'low':this.pickMe==2?'high':this.pickMe==3?'heartbeat':''
      if(dd==''){return false}
      if(ele=='<'){
        this.newData[dd] = (this.newData[dd]+'').replace(/.$/, '')
        if(this.newData[dd]<=0){
          this.newData[dd] = 0
        }
      }else{
        if(this.newData[dd]*1>=100){
          this.pickMe++
          return false
        }
        this.newData[dd] = (this.newData[dd]*1 + ele)*1
      }
      if(this.newData[dd]>=250){
        this.pickMe++
        if(this.pickMe>=4){
          this.pickMe=1
        }
      }


    },
  },
});

 