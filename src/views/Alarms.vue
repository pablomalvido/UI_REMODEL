<template>
<div id="prop">
    <TitlePage page='Alarms'/>
</div>

<div class="content">
    <h1 v-if="safety_status==0">Alarm Status: ALARMS</h1>
    <h1 v-if="safety_status==1">Alarm Status: No alarms</h1>
    <h1 v-if="safety_status==2">Alarm Status: Not connected to RSM</h1>
    <div>
        <div v-if="active_alarms.length>0" class="alarms active">
            <h3>Active alarms</h3>
            <ul v-for="(alarm, key) in active_alarms" :key="key">
                <li>{{ alarm }}</li>
            </ul>
        </div>
        <div v-if="inactive_alarms.length>0" class="alarms inactive">
            <h3>Inactive alarms</h3>
            <ul v-for="(alarm, key) in inactive_alarms" :key="key">
                <li>{{ alarm }}</li>
            </ul>
        </div>
        <button v-if="safety_status==0" @click="reset_alarms()">Reset</button>
    </div>
</div>
</template>

<script>
import TitlePage from '@/components/Title_page.vue';

export default {
    
    name: 'Alarms',
    
    components: {TitlePage},

    data(){
        return{
            ros: null,
            rosCon: false,            
            listener_reset: null,
            listener_alarms: null,
            listener_safety: null,
            resetPublisher:null,
            resetTopic:null,
            update_safety_topic: null,
            RSM_node_name: 'RSM_PLC_connection',
            safety_status: 2,//0, //0: Alarm, 1: Safety OK, 2: Not connected to RSM
            active_alarms: [],//['Emergency stop button', 'Door of the cell open'],
            inactive_alarms: [],//['Light curtain detection'],
            active_alarms_temp : [],
            inactive_alarms_temp : [],
            test: "",
            problems: {"robot": {"detected": false, "active": false}, "Estop": {"detected": false, "active": false}, "curtain": {"detected": false, "active": false}, "door": {"detected": false, "active": false}, "UI": {"detected": false, "active": false}, "vision": {"detected": false, "active": false}},
        }
    },

    methods: {
        init_subscribers(){
            this.listener_reset = new ROSLIB.Topic({
                ros : this.ros,
                name : '/RSM/reset',  // /RSM/ROS_reset for tests
                messageType : 'std_msgs/Bool' //Change this for your topic type
            });        
            this.listener_reset.subscribe((message) => {
                console.log('Received message on ' + this.listener_reset.name + ': ' + message.data);
                if(message.data){
                    this.active_alarms = [];
                    this.inactive_alarms = [];
                    console.log("Alarms reseted");
                }
            });

            this.listener_alarms = new ROSLIB.Topic({
                    ros : this.ros,
                    name : '/RSM/problems',  //Change this for your topic name
                    messageType : 'remodel_safety_manager/RSM_problems' //Change this for your topic type
            });
            this.listener_alarms.subscribe((message) => {
                console.log('Received message on ' + this.listener_alarms.name + ': ' + message.curtain_det);
                this.active_alarms_temp = [];
                this.inactive_alarms_temp = [];
                this.test_="No";
		        if(message.Estop_det){
			        if(message.Estop_act){
			            this.active_alarms_temp.push("Pressed emergency stop button")
			        } else {
			            this.inactive_alarms_temp.push("Pressed emergency stop button (inactive)")
			        }
		        }
		        if(message.door_det){
			        if(message.door_act){
			            this.active_alarms_temp.push("The door of the cell was opened")
			        } else {
			            this.inactive_alarms_temp.push("The door of the cell was opened (inactive)")
			        }       
		        }
		        if(message.curtain_det){
			        if(message.curtain_act){
			            this.active_alarms_temp.push("Light curtain detection")
			        } else {
			            this.inactive_alarms_temp.push("Light curtain detection (inactive)")
			            this.test_="Yes"
			        }
		        }
		      
		        if(message.UI_det){
			        if(message.UI_act){
			            this.active_alarms_temp.push("User Interface emergency stop button")
			        } else {
			            this.inactive_alarms_temp.push("User Interface emergency stop button (inactive)")
			        }
		        }
		        if(message.vision_det){
			        if(message.vision_act){
			            thisactive_alarms_temp.push("Vision system alarm")
			        } else {
			            this.inactive_alarms_temp.push("Vision system alarm (inactive)")
			        }
		        }
                
		        this.active_alarms = this.active_alarms_temp;
		        this.inactive_alarms = this.inactive_alarms_temp;
		        console.log("Inactive alarms: " + test_)
                console.log("Alarms updated");
            });   

            this.listener_safety = new ROSLIB.Topic({
                ros : this.ros,
                name : '/RSM/safety_ok',  //Change this for your topic name
                messageType : 'std_msgs/Bool' //Change this for your topic type
            });
            this.listener_safety.subscribe((message) => {
                console.log('Received message on ' + this.listener_safety.name + ': ' + message.data);
                if(message.data){
                    this.safety_status = 1
                } else {
                    this.safety_status = 0
                }			
                console.log("Safety updated");
            });
        },

        stop_subscribers(){
            if(this.listener_reset){
                this.listener_reset.unsubscribe();
            }
            if(this.listener_alarms){
                this.listener_alarms.unsubscribe();
            }
            if(this.listener_safety){
                this.listener_safety.unsubscribe();
            }
        }, 

        check_RSM_connection(){ //App.vue must check this constantly and Publish safety not ok if the connection is not stablished
            this.ros.getNodes((nodes) => {
                if (nodes.includes(this.RSM_node_name)){                        
                    this.update_safety_topic = new ROSLIB.Topic({
                        ros : this.ros,
                        name : '/RSM/get_safety',
                        messageType : 'std_msgs/Bool'
                    });
                    var message_topic = new ROSLIB.Message({
                        data: true
                    });
                    this.update_safety_topic.publish(message_topic);
                }
                else{
                    console.log("RSM Node not started yet")
                    this.safety_status = 2
                }
            });
        },

        reset_alarms(){      
            console.log("Reset function");
            this.resetPublisher = new ROSLIB.Topic({
                ros : this.ros,
                name : '/RSM/ROS_reset',
                messageType : 'std_msgs/Bool'
            });
            this.resetTopic = new ROSLIB.Message({
                data: true
            });
            resetPublisher.publish(resetTopic);
        },
    },

    mounted(){
        this.url = 'ws://' + (((window.location.href).split("/")[2]).split(":")[0]) + ':9090';
        this.ros = new ROSLIB.Ros({
            url : this.url //'ws://192.168.43.168:9090'
        });
        
        this.ros.on('connection', () => {
            console.log('Connected to websocket server.');
            this.rosCon = true
            this.init_subscribers()
            //this.check_RSM_connection()
        });
        this.ros.on('error', (error) => {
            console.log('Error connecting to websocket server: ', error);
            this.rosCon = false
        });
        this.ros.on('close', () => {
            this.rosCon = false
            console.log('Connection to websocket server closed.');
        });
    },

    unmounted(){
        this.stop_subscribers()
        this.ros.close()
    }
}
    
</script>

<style scoped>

.content{
    /* position: relative; */
    margin: 40px 10% 20px 20px;
    text-align: center;
    align-items: center;
    justify-content: center;

}
ul {
  list-style-type: none;
}
.alarms{
    margin: auto;
    width: 400px;
    min-width: fit-content;
    padding: 10px;
    align-items: center;
    text-align: center;
    border-radius: 15px;
}
.active{
    background-color: #3c365f;
    border: 2px solid #1d1b31;
    color:white;
    margin-top: 30px;
}
.inactive{
    background-color: #8381a1;
    border: 2px solid #1d1b31;
    color: #1d1b31;
    margin-top: 30px;
    margin-bottom: 20px;
}
button{
  border: 1px solid #1d1b31;
  border-radius: 5px;
  margin-top: 20px;
  margin-left: 20px;
  padding: 8px;
  padding-left: 12px;
  padding-right: 12px;
  font-size: 17px;
}
h3{
    margin-bottom: 15px;
}
li{
    margin: 5px;
}
</style>