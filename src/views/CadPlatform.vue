<template>
  <div>
    <TitlePage page='CAD Platform'/>
  </div>

  <div class="content">
    <div class="container">

        <div class="left_content">
            <div class="Selection">
                <p>Select USB: </p>
                <select v-model="usb_selected" :onchange="update_files_usb()">
                    <option disabled value="">Please Select</option>
                    <option v-for="(usb, index) in usb_list" :key="index" :value="usb">{{usb}}</option>
                </select>
            </div>
            <div class="Selection">
                <p>File to upload: </p>
                <select v-model="usb_file_selected" :onchange="filter_extension()">
                    <option disabled value="">Please Select</option>
                    <option v-for="(file, index) in usb_files" :key="index" :value="file">{{file}}</option>
                </select>
            </div>
            <div class="Selection">
                <p>File to replace: </p>
                <select v-model="CAD_file_selected">
                    <option disabled value="">Please Select</option>
                    <option v-for="(file, index) in CAD_files_filtered" :key="index" :value="file">{{file}}</option>
                </select>
            </div>
            <button :disabled="modeProp=='Running' || usb_selected=='' || usb_file_selected=='' || CAD_file_selected==''" @click="replace_file()">Upload</button>
        </div>

        <div class="right_content">
            <div class="logs">
                <h3>Logs</h3>
                <div class="messages">
                    <ul v-for="(message_log, key) in logs" :key="key">
                        <il>{{message_log}}</il>
                    </ul>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import ROSLIB from "roslib";
import TitlePage from '@/components/Title_page.vue';

export default {
  name: 'CadPlatform',

  components: {TitlePage},

  data(){
    return{
      rosCon: false,
      modeProp: 'Idle',
      menuOpen: true,
      get_usbs_service: null,
      get_usb_files_service: null,
      move_file_service: null,
      usb_selected: '',
      prev_usb_selected: '',
      usb_list: [],
      usb_file_selected: '',
      usb_files: [],
      CAD_file_selected: '',
      CAD_files: ['platform_cad.x3d', 'platform_ids.wri', 'combs_cad.x3d', 'combs_ids.wri', 'ATC_cad.x3d', 'ATC_ids.wri', 'Jigs_definition_v2.xml', 'Components_definition.csv', 'WH_configuration.xml', 'Assembly_sequence.csv', 'stl/platform'],      
      CAD_files_filtered: [],
      logs: [], //['Logs console...'],
    }
  },

  methods: {
    init_subscribers(){
      this.topic_mode = new ROSLIB.Topic({
        ros : this.ros,
        name : '/UI/mode',
        messageType : 'std_msgs/String'
      });
      this.topic_mode.subscribe((message) => {
        this.modeProp = message.data;
      });
    },

    stop_subscribers(){
      if(this.topic_mode){
        this.topic_mode.unsubscribe();
      }
    },

    init_services(){
      this.get_mode_service = new ROSLIB.Service({
          ros : this.ros,
          name : '/UI/get_mode',
          serviceType : 'std_srvs/Trigger'
      });
      this.get_usbs_service = new ROSLIB.Service({
          ros : this.ros,
          name : '/UI/get_usbs',
          serviceType : 'UI_nodes_pkg/GetList'
      });
      this.get_usb_files_service = new ROSLIB.Service({
          ros : this.ros,
          name : '/UI/get_files_usb',
          serviceType : 'UI_nodes_pkg/GetFiles'
      });    
      this.move_file_service = new ROSLIB.Service({
          ros : this.ros,
          name : 'UI/copy_file',
          serviceType : 'UI_nodes_pkg/MoveFile'
      });
    },

    publish_string_constant(topic, message){
      var loadPublisher = new ROSLIB.Topic({
        ros : this.ros,
        name : topic,
        messageType : 'std_msgs/String'
      });

      var loadTopic = new ROSLIB.Message({
          data: message
      });

      loadPublisher.publish(loadTopic);
    },

    check_mode(){
      var request = new ROSLIB.ServiceRequest({});  
      this.get_mode_service.callService(request, (result) => {
        this.modeProp = result.message
        if (result.message == "Running"){
          this.robot_moving = true
        }
        else{
          this.robot_moving = false
        }
      });
    },

    updateTrajs(){
      var request = new ROSLIB.ServiceRequest({});  
      this.get_trajs_service.callService(request, (result) => {
        this.trajectory_list = []
        if(result.success){
          for (const [key, traj_name] of Object.entries(result.data)){
            this.trajectory_list.push(traj_name)
          }
        }
      });
    },

    record_traj_function(opt){
      var request = new ROSLIB.ServiceRequest({
        robotNumber: this.group_selected,
        recordPose: false,
        moveGripper: false,
        closeGripper: false,
        tape: false,
        saveTraj: false,
        fileName: this.group_selected + '_' + this.traj_name,
      });  
      if(opt=='pose'){
        request.recordPose = true;
      }
      else if(opt=='gripper_move'){
        request.moveGripper = true;
      }
      else if(opt=='gripper_grasp'){
        request.closeGripper = true;
      }
      else if(opt=='tape'){
        request.tape = true;
      }
      else if(opt=='save'){
        request.saveTraj = true;
      }
      this.traj_record_service.callService(request, (result) => {
        this.add_logs(result.result)
        if(result.success){
          if(opt=='save'){
            this.poses_count = 0;
            this.traj_name = '';
            this.updateTrajs();
          }
          else{
            this.poses_count += 1;
          }
        }
      });
    },

    exec_traj_func(){
      this.add_logs("Executing trajectory: " + this.traj_selected + "...")
      this.publish_string_constant('/UI/mode','Running')
      var request = new ROSLIB.ServiceRequest({
        data: this.traj_selected,
      });  
      this.exec_traj_service.callService(request, (result) => {
        this.add_logs(result.result)
        this.publish_string_constant('/UI/mode','Idle')
      });
    },

    del_traj_func(){
      this.add_logs("Deleting trajectory: " + this.traj_selected + "...")
      var request = new ROSLIB.ServiceRequest({
        data: this.traj_selected,
      });  
      this.del_traj_service.callService(request, (result) => {
        this.add_logs(result.result)
        this.traj_selected = ''
      });
    },

    get_usb_info(){
        var request = new ROSLIB.ServiceRequest({});  
        this.get_usbs_service.callService(request, (result) => {
            if(result.success){
                var new_usb_list = []
                for (const [key, usb_name] of Object.entries(result.data)){
                    new_usb_list.push(usb_name)
                }
                if (!(this.usb_list.join() == new_usb_list.join())){
                    this.usb_list = new_usb_list
                }
                if (!(this.usb_list.includes(this.usb_selected))){
                    this.usb_selected = ''
                    this.usb_file_selected = ''
                    this.CAD_file_selected = ''
                }
                if (this.usb_list.length==0){
                    this.usb_files = []
                }
            }
            setTimeout(() => {
                  this.get_usb_info()
            }, 1000)
        });
    },

    update_files_usb(){
        if (this.usb_selected != this.prev_usb_selected){
            this.prev_usb_selected = this.usb_selected
            if(this.usb_selected != ''){
                var request = new ROSLIB.ServiceRequest({
                    data: this.usb_selected
                });  
                this.get_usb_files_service.callService(request, (result) => {
                    if(result.success){
                        this.usb_files = []
                        for (const [key, usb_name] of Object.entries(result.data)){
                            this.usb_files.push(usb_name)
                        }
                        if (!(this.usb_files.includes(this.usb_file_selected))){
                            this.usb_file_selected = ''
                        }
                    }
                });
            }
        }
    },

    replace_file(){
        var request = new ROSLIB.ServiceRequest({
            source: this.usb_selected+"/"+this.usb_file_selected,
            destination: this.CAD_file_selected,
        });  
        this.move_file_service.callService(request, (result) => {
            if(result.success){
                this.add_logs(this.CAD_file_selected + " was overwritten successfully")
            }
            else{
                this.add_logs("Error overwritting " + this.CAD_file_selected)
            }
        });    
    },

    filter_extension(){
      this.CAD_files_filtered = []
      if (this.usb_file_selected != ''){
        const selected_extension = this.usb_file_selected.split('.')[1]
        for (const [key, file_name] of Object.entries(this.CAD_files)){
          if(file_name.split('.')[1] == selected_extension){
            this.CAD_files_filtered.push(file_name)
          }
        }
        if (this.CAD_file_selected.split('.')[1] != selected_extension){
          this.CAD_file_selected = ''
        }
      }
    },

    add_logs(msg){
      var time_now= new Date().toLocaleTimeString();
      time_now=time_now.slice(0,-3);
      this.logs.unshift(time_now + ": " + msg);
    },
  },

  mounted(){
    this.url = 'ws://' + (((window.location.href).split("/")[2]).split(":")[0]) + ':9090';
    this.ros = new ROSLIB.Ros({
        url : this.url //'ws://192.168.43.168:9090'
    });
    console.log(this.ros)
    
    this.ros.on('connection', () => {
      console.log('Connected to websocket server.');
      this.rosCon = true
      this.init_subscribers()
      this.init_services()
      this.check_mode()
      this.get_usb_info()
    })

    this.ros.on('error', (error) => {
      console.log('Error connecting to websocket server: ', error);
      this.rosCon = false
    })

    this.ros.on('close', () => {
      this.rosCon = false
      console.log('Connection to websocket server closed.');
    })
  },

  unmounted(){
    this.stop_subscribers()
    this.ros.close()
  }
}
</script>

<style scoped>

.content{
  position: relative;
  margin: 20px;
  margin-top: 60px;
  z-index: 200;
}
.container{
  margin: auto;
  text-align: center;
  align-items: center;
  justify-content: center;
  width: fit-content;
}
.left_content{
  width: fit-content;
  display: inline-block;
  float: left;
  /* left: 29%; */
  margin-right: 100px;
}
.right_content{
  width: 420px;
  display: inline-block;
  float: left;
  /* left: 29%; */
}
select{
  padding:1px;
  padding-left:5px;
  padding-right: 5px;
  border: 1px solid #1d1b31;
  border-radius: 5px;
}
.left_content{
  background-color: #49485e;
  width: fit-content;
  border-radius: 15px;
  border: 2px solid #1d1b31;
  color:white;
  padding: 0px 15px 10px 15px;
}
.Execute{
  background: #716f8c;
  width: fit-content;
  border-radius: 15px;
  border: 2px solid #1d1b31;
  color:white;
  padding: 5px 15px 15px 15px;
  margin: auto;
}
button{
  border: 1px solid #1d1b31;
  border-radius: 5px;
}
.left_content h3{
  margin-top: 10px;
  padding-bottom: 10px;
}
.Selection{
  margin-top: 20px;
}
.Selection *{
    display: inline-block;
}
button{
  width: 80px;
  height: 40px;
  margin: 5px;
  margin-top: 30px;
  font-size: 14px;
}
select{
  height: 30px;
  min-width: 230px;
  width: fit-content;
  padding: 2px 5px 2px 5px;
  margin: 0px 10px 0px 3px;
}
.Selection p{
  width: fit-content; 
  min-width: 130px;
  text-align: right;
  margin-right: 5px;
}
.logs{
  background: #1d1b31;
  border: 5px solid #1d1b31;
  color: white;
  border-radius: 8px;
  padding: 5px;
  padding-bottom: 8px;
}
.logs .messages{
  height: 330px;
  overflow: scroll;
  background: #716f8c;
  color: #1d1b31;
  margin-top: 8px;
  border-radius: 5px;
  padding: 5px;
  display:flex; 
  text-align: left;
  flex-direction:column-reverse;
}
.logs .messages *{
  padding: 4px;
}
</style>