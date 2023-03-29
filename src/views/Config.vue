<template>
  <div>
    <TitlePage page='Config'/>
  </div>

  <div class="content">
    <button :disabled="!config_changed" @click="save_changes">Save changes</button>
    <ul v-for="(value, key) in parameters_msgs" :key="key">
      <li>
        <h3 class="title_config">{{value.group}}</h3>
        <div class ="inline_items">
          <div v-for="(value2, key2) in value.params" :key="key2">
            <label class="config_name inline_items_config">{{value2.name}}: </label>
            <input type="text" class="config_value inline_items_config" v-model="value2.val" @change="config_changed=true">
          </div>
        </div>
      </li>
    </ul>
    <!-- <button :disabled="!config_changed" @click="save_changes">Save changes</button> -->
  </div>
</template>

<script>
import ROSLIB from "roslib";
import TitlePage from '@/components/Title_page.vue';

export default {
  name: 'Config',

  components: {TitlePage},

  data(){
    return{
      rosCon: false,
      set_config_service: null,
      get_config_service: null,
      parameters_msgs: 
        [{group:'Speed', params: 
          [{name: 'Speed slow demo (mm/s)', prop: 'speed_slow_demo_mms', val: 'NaN'}, 
          {name: 'Speed medium demo (mm/s)', prop: 'speed_medium_demo_mms', val: 'NaN'}, 
          {name: 'Speed fast demo (mm/s)',prop: 'speed_fast_demo_mms', val: 'NaN'},
          {name: 'Speed slow demo (%)', prop: 'speed_slow_demo_per', val: 'NaN'}, 
          {name: 'Speed medium demo (%)', prop: 'speed_medium_demo_per', val: 'NaN'}, 
          {name: 'Speed fast demo (%)', prop: 'speed_fast_demo_per', val: 'NaN'},
          {name: 'Speed slow real (mm/s)', prop: 'speed_slow_real_mms', val: 'NaN'}, 
          {name: 'Speed medium real (mm/s)', prop: 'speed_medium_real_mms', val: 'NaN'}, 
          {name: 'Speed fast real (mm/s)',prop: 'speed_fast_real_mms', val: 'NaN'},
          {name: 'Speed slow real (%)', prop: 'speed_slow_real_per', val: 'NaN'}, 
          {name: 'Speed medium real (%)', prop: 'speed_medium_real_per', val: 'NaN'}, 
          {name: 'Speed fast real (%)', prop: 'speed_fast_real_per', val: 'NaN'}]},
        {group: 'Offsets', params:
          [{name: 'Offset Z (mm)', prop: 'offset_z', val: 'NaN'},
          {name: 'Offset X (mm)', prop: 'offset_x', val: 'NaN'}]},
        {group: 'Grippers', params:
          [{name: 'Open distance (mm)', prop: 'open_dist', val: 'NaN'},
          {name: 'Slide distance (mm)', prop: 'slide_dist', val: 'NaN'},
          {name: 'Grasp distance (mm)', prop: 'grasp_dist', val: 'NaN'},
          {name: 'Gripper speed (mm/s)', prop: 'speed_gripper', val: 'NaN'}]},
        {group: 'Force sensor', params:
          [{name: 'Cable tension (N)', prop: 'cable_tension', val: 'NaN'},
          {name: 'Force control (Y/N)', prop: 'force_control', val: 'NaN'}]}],
      config_file_name: '../files/config.csv',
      config_changed: false,
    }
  },

  methods: {

    init_services(){
        this.get_config_service = new ROSLIB.Service({
            ros : this.ros,
            name : '/UI/get_config',
            serviceType : 'UI_nodes_pkg/GetConfig'
        });
        this.set_config_service = new ROSLIB.Service({
            ros : this.ros,
            name : '/UI/set_config',
            serviceType : 'UI_nodes_pkg/SetConfig'
        });
    },

    update_variables(){
      var request = new ROSLIB.ServiceRequest({
        file_name: this.config_file_name,
      });  
      this.get_config_service.callService(request, (result) => {
        console.log(result)
        for (const [key, el] of Object.entries(result.data)) {
          for (let i = 0; i < this.parameters_msgs.length; i++) {
            for (let j = 0; j < this.parameters_msgs[i].params.length; j++) {
              if(this.parameters_msgs[i].params[j].prop == el.prop){
                this.parameters_msgs[i].params[j].val = el.value
                break
              }
            }
          }
        }
      });
    },

    save_changes(){
      console.log("Saving changes...")
      var message_data = []
      for (let i = 0; i < this.parameters_msgs.length; i++) {
        for (let j = 0; j < this.parameters_msgs[i].params.length; j++) {
          var message_i = new ROSLIB.Message({
            prop: this.parameters_msgs[i].params[j].prop,
            value: this.parameters_msgs[i].params[j].val,
          });
          message_data.push(message_i)
        }
      }
      var request = new ROSLIB.ServiceRequest({
        file_name: this.config_file_name,
        data: message_data,
      });
      this.set_config_service.callService(request, (result) => {
        console.log(result)
        if(result.success){
          this.config_changed = false
        }
      });
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
      this.init_services()
      this.update_variables()
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
    this.ros.close()
  }
}

</script>

<style scoped>

.content{
  position: relative;
  margin: 20px;
  z-index: 200;
}
.inline_items *{
  display: inline-block;
}
.block_items *{
  margin: auto;
  display: block;
}
.block_items{
  margin: auto;
}
.inline_items_config{
  display: inline-block;
  padding: 2px;
  margin: 10px;
}
input{
  text-align: right;
  border: 0px solid #1d1b31;
  font-size: 16px;
  border-radius: 3px;
  padding-right: 1px; 
}
.config_name{
  width: 250px;
  margin-right: 5px;
  text-align: right;
}
.config_value{
  background-color: #716f8c;
  /* color: #1d1b31; */
  color: white;
  padding: 3px;
  padding-left: 5px;
  border-radius: 5px;
  width: 100px;
  text-align: left;
}
ul {
  list-style-type: none;
}
.title_config{
  margin-left: 20px;
  margin-top: 50px;
  margin-bottom: 10px;
  font-size: 25px;
}
button{
  border: 1px solid #1d1b31;
  border-radius: 5px;
  /* margin-top: 50px; */
  margin-top: 20px;
  margin-left: 20px;
  padding: 8px;
  font-size: 17px;
}
</style>