<template>
<div id="prop">
    <TitlePage page='Alarms'/>
</div>
  
<div id="Secondary_box">

 <div id="Alarm_title">  
    <h1 id="red" v-if="alarm_title=='ALARMS!'">Alarm Status: {{ alarm_title }}</h1>
    <h1 v-else-if="alarm_title=='NO ALARMS'">Alarm Status: {{ alarm_title }}</h1>
    <h1 v-else>Alarm Status: No Alarms</h1>
</div> 
<br>
<div id="active_inactive">
    <div id="alarms" >
		<!--Shows the list of all the alarms, the active ones (in bold) and the inactive (but not resetted) in light grey-->
        <p class="active" v-for="alarm in active_alarms">
			Active alarms: {{ alarm }}
		</p>
		<p class="inactive" v-for="alarm in inactive_alarms">
			Inactive alarms: {{ alarm }}
		</p>
	</div>
<div id="reset_button">    
    <input type="button" id="Btn_Reset" value="Reset" @click="reset_alarms()">
</div>
</div>

</div>
</template>

<script>
import TitlePage from '@/components/Title_page.vue';
// import VueSidebarMenuAkahon from '@/components/Sidebar-menu-akahon.vue';

export default {
    name: 'Alarms',

    components: {TitlePage},
    

    data(){
        return{
            rosCon: false,            
            listener_reset: null,
            listener_alarms: null,
            listener_safety: null,
            resetPublisher:null,
            resetTopic:null,
            alarm_title:"",
            active_alarms: [],
            inactive_alarms: [],
            active_alarms_temp : [],
            inactive_alarms_temp : [],
            test: "",
            problems: {"robot": {"detected": false, "active": false}, "Estop": {"detected": false, "active": false}, "curtain": {"detected": false, "active": false}, "door": {"detected": false, "active": false}, "UI": {"detected": false, "active": false}, "vision": {"detected": false, "active": false}}
        }
    },

    methods: {
        init_subscriber(){

            this.listener_reset = new ROSLIB.Topic({
                ros : this.ros,
                name : '/RSM/reset',  // /RSM/ROS_reset for tests
                messageType : 'std_msgs/Bool' //Change this for your topic type
            });
        
            this.listener_reset.subscribe(function(message) {
                console.log('Received message on ' + listener_reset.name + ': ' + message.data);
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

            this.listener_alarms.subscribe(function(message) {
                console.log('Received message on ' + listener_alarms.name + ': ' + message.curtain_det);

                active_alarms_temp = [];
                inactive_alarms_temp = [];
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
		        this.inactive_alarms =this.inactive_alarms_temp;
		        console.log("Inactive alarms: " + test_)
                      console.log("Alarms updated");
            });   

            this.listener_safety = new ROSLIB.Topic({
                ros : this.ros,
                name : '/RSM/safety_ok',  //Change this for your topic name
                messageType : 'std_msgs/Bool' //Change this for your topic type
            });

            listener_safety.subscribe(function(message) {
                console.log('Received message on ' + listener_safety.name + ': ' + message.data);
		            if(message.data){
			            this.alarm_title = "NO ALARMS"
		            } else {
			            this.alarm_title = "ALARMS!"
		            }			
                      console.log("Safety updated");
                    });

            this.loadPublisher = new ROSLIB.Topic({
        		ros : this.ros,
        		name : '/RSM/load_page',
        		messageType : 'std_msgs/Bool'
      		    });

      		this.loadTopic = new ROSLIB.Message({
        		data: true
      		    });

		    this.loadPublisher.publish(this.loadTopic);

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

        

        // if(rosCon == false){
        //         ros = new ROSLIB.Ros({
        //             url : 'ws://192.168.43.168:9090' //Port = 9090
        //         });

        mounted(){
            this.ros = new ROSLIB.Ros({
            url : 'ws://192.168.43.168:9090' //Port = 9090
            });
            console.log(this.ros)
            
            this.ros.on('connection', () => {
            console.log('Connected to websocket server.');
            this.rosCon = true
            this.init_subscriber()
            // this.init_services()
            })

            this.ros.on('error', (error) => {
            console.log('Error connecting to websocket server: ', error);
            this.rosCon = false
            })

            this.ros.on('close', () => {
            this.rosCon = false
            console.log('Connection to websocket server closed.');
            })

            // this.global_launching = true
            // this.getLaunchersState()
        },

    unmounted(){
            this.ros.close()
        }
    }

}

    
</script>

<style scoped>
#Secondary_box{
    background-color:gray;
    /* position: relative; */
    
    /* margin: 40px 10% 20px 20px; */
    margin:20%;
    /* z-index: 200; */
    /* overflow: scroll; 
    text-overflow: ellipsis; */
    /* white-space: nowrap; */
    text-align: center;
    display: block;
    align-items: center;
    justify-content: center;
    color: white;
}
#Alarm_title{
    margin:20%;
    width:50%;
    height:20%;
    white-space: nowrap;
    text-align: center;
    display: block;
    /* overflow: auto; */
    }
#red{
    color: red; 
}


#active_inactive{
    /* z-index: 300; */
    /* position: relative; */
    display: block;
    width:50%;
    height:20%;
    margin:20%;
    overflow:auto;
    padding: 5%;
}
.active{
    color: black;
    font-weight: bold;
}

.inactive{
    color:white;
}

h1{
    margin: 10%;
}

#Btn_Reset{
    margin-top: 20%;
    width: 20%;
    padding: 1%;
    font-size: 100%;
    font-weight: bold

}
</style>