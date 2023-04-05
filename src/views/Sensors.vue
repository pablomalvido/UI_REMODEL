<template>
  <div>
    <TitlePage page='Sensors'/>
  </div>
  <div class="content">
    <!-- <h1>Right tactile sensor</h1>
    <div class="canvas_container">
      <canvas id="chartForceR"></canvas>
    </div>
    <button @click="chart_chart()">Change data</button>
    <div class="canvas_container">
      <canvas id="myChartMultiple"></canvas>
    </div> -->

    <div class="selection">
    <input type="checkbox" id="fr" value="FR" v-model="checkedCharts" @click="check_graph('FR')">
    <label for="fr">Force right</label>

    <input type="checkbox" id="fl" value="FL" v-model="checkedCharts" @click="check_graph('FL')">
    <label for="fl">Force left</label>
    </div>

    <ul>
      <li>
        <div class ="inline_items">
          <div v-if="checkedCharts.includes('FR')">
            <div class="canvas_container">
              <canvas id="chartForceR"></canvas>
            </div>
          </div>
          <div v-if="checkedCharts.includes('FL')">
            <div class="canvas_container">
              <canvas id="chartForceL"></canvas>
            </div>
          </div>
        </div>
      </li>
    </ul>

  </div>
</template>

<script>
import ROSLIB from "roslib";
import { markRaw } from 'vue';
import Chart from 'chart.js/auto'
import TitlePage from '@/components/Title_page.vue';


export default {
  name: 'Sensors',

  components: {TitlePage},
  
  data(){
    return{
      msg: 'Hellooo',
      rosCon: false,
      modeProp: '',
      username: '',
      password: '',
      role: this.$route.params.role,
      checkedCharts: ['FR', 'FL'],
      data_chart: {},
      chartForceR: null,
      chartForceL: null,
      myChartMultiple: null,
    }
  },

  methods: {

    init_subscribers(){
      this.forceR_topic = new ROSLIB.Topic({
        ros : this.ros,
        name : 'sensors/force_right',
        messageType : 'UI_nodes_pkg/forces'
      });
      this.forceR_topic.subscribe((message) => {
        var forces_msg = [message.Fx, message.Fy, message.Fz, message.Tz, message.Ty, message.Tz]
        for (let i = 0; i < 6; i++) {  
          var values = this.chartForceR.data.datasets[i].data.slice(1);
          values.push(forces_msg[i])
          this.chartForceR.data.datasets[i].data = values;
        }
        var valuesX = this.chartForceR.data.labels.slice(1);
        valuesX.push(valuesX[valuesX.length-1]+1)
        this.chartForceR.data.labels = valuesX
        this.chartForceR.update();
      });

      this.forceL_topic = new ROSLIB.Topic({
        ros : this.ros,
        name : 'sensors/force_left',
        messageType : 'UI_nodes_pkg/forces'
      });
      this.forceL_topic.subscribe((message) => {
        var forces_msg = [message.Fx, message.Fy, message.Fz, message.Tz, message.Ty, message.Tz]
        for (let i = 0; i < 6; i++) {  
          var values = this.chartForceL.data.datasets[i].data.slice(1);
          values.push(forces_msg[i])
          this.chartForceL.data.datasets[i].data = values;
        }
        var valuesX = this.chartForceL.data.labels.slice(1);
        valuesX.push(valuesX[valuesX.length-1]+1)
        this.chartForceL.data.labels = valuesX
        this.chartForceL.update();
      });
    },

    check_graph(graph_name){
      if (graph_name=="FR"){
        if (!(this.checkedCharts.includes(graph_name))){
          console.log("Creating")
          setTimeout(() => {
              this.createChartForceR()
          }, 50)
        }
        else{
          console.log("Destroying")
          //this.chartObjForcesR.destroy()
          this.chartForceR.destroy()
        }
      }
      else if (graph_name=="FL"){
        if (!(this.checkedCharts.includes(graph_name))){
          console.log("Creating")
          setTimeout(() => {
              this.createChartForceL()
          }, 50)
        }
        else{
          console.log("Destroying")
          this.chartForceL.destroy()
        }
      }
    },

    publish_string(topic, message){
      var loadPublisher = new ROSLIB.Topic({
        ros : this.ros,
        name : topic,
        messageType : 'std_msgs/String'
      });

      var loadTopic = new ROSLIB.Message({
        data: message['msg']
      });

      loadPublisher.publish(loadTopic);
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

    createChartForceR(){
      const ctx = document.getElementById('chartForceR');
      var labels = [];
      var y_values = [];
      for (let i = 0; i < 51; i++) {  
        labels.push(i)
        y_values.push(0)
      }
      this.data_chart = {
        labels: labels,
        datasets: [{label: 'Fx', data: y_values, fill: false, borderColor: 'rgb(75, 192, 192)', tension: 0.1},
          {label: 'Fy', data: y_values, fill: false, borderColor: 'rgb(192, 75, 192)', tension: 0.1},
          {label: 'Fz', data: y_values, fill: false, borderColor: 'rgb(192, 192, 75)', tension: 0.1},
          {label: 'Tx', data: y_values, fill: false, borderColor: 'rgb(75, 75, 192)', tension: 0.1},
          {label: 'Ty', data: y_values, fill: false, borderColor: 'rgb(75, 192, 75)', tension: 0.1},
          {label: 'Tz', data: y_values, fill: false, borderColor: 'rgb(192, 75, 75)', tension: 0.1},]
      };

      const chartObjForcesR = new Chart(ctx, {
        type:'line',
        data: this.data_chart,
        options: {
          plugins:{
              //legend: {
              //  display: false
              //}
              title: {
                display: true,
                text: 'Right force sensor',
                color: '#000',
                font: {
                        size: 20,
                    },
              }
         },
          elements: {
                    point:{
                        radius: 0
                    }
                },
          scales: {
            y: {
                max: 100,
                min: -100,
                ticks:{
                  maxTicksLimit: 11,
                }
            },
            x: {
              display: false,
            }
          },
        },
      });
      
      chartObjForcesR.options.transitions.active.animation.duration = 0;
      chartObjForcesR.options.animation = false;

      //Object.seal(chartObjForcesR);
      //this.chartForceR = chartObjForcesR;
      this.chartForceR = markRaw(chartObjForcesR)

      this.chartForceR;
    },
      // const ctxM = document.getElementById('myChartMultiple');
      // const labelsM = ['Jan','Feb','Mar','Apr','May','Jun','Jul'];
      // var data_chartM = {
      //   labels: labelsM,
      //   datasets: [{
      //     label: 'Fx',
      //     data: [65, 59, 80, 81, 56, 55, 40],
      //     fill: false,
      //     borderColor: 'rgb(75, 192, 192)',
      //     tension: 0.1
      //   },
      //   {
      //     label: 'Fy',
      //     data: [34, 43, 10, 50, 81, 75, 20],
      //     fill: false,
      //     borderColor: 'rgb(192, 75, 192)',
      //     tension: 0.1
      //   }]
      // };

      // const chartObjM = new Chart(ctxM, {
      //   type:'line',
      //   data: data_chartM,
      //   options: {
      //     scales: {
      //       y: {
      //           max: 100,
      //           min: 0,
      //           ticks:{
      //             maxTicksLimit: 6,
      //           }
      //       }
      //     },
      //   },
      // });
      
      // chartObjM.options.transitions.active.animation.duration = 0;
      // chartObjM.options.animation = false;

      // //Object.seal(chartObj);
      // this.myChartMultiple = markRaw(chartObjM)

      // this.myChartMultiple;
    //},

    createChartForceL(){
      const ctx = document.getElementById('chartForceL');
      var labels = [];
      var y_values = [];
      for (let i = 0; i < 51; i++) {  
        labels.push(i)
        y_values.push(0)
      }
      var data_chrt = {
        labels: labels,
        datasets: [{label: 'Fx', data: y_values, fill: false, borderColor: 'rgb(75, 192, 192)', tension: 0.1},
          {label: 'Fy', data: y_values, fill: false, borderColor: 'rgb(192, 75, 192)', tension: 0.1},
          {label: 'Fz', data: y_values, fill: false, borderColor: 'rgb(192, 192, 75)', tension: 0.1},
          {label: 'Tx', data: y_values, fill: false, borderColor: 'rgb(75, 75, 192)', tension: 0.1},
          {label: 'Ty', data: y_values, fill: false, borderColor: 'rgb(75, 192, 75)', tension: 0.1},
          {label: 'Tz', data: y_values, fill: false, borderColor: 'rgb(192, 75, 75)', tension: 0.1},]
      };

      const chartObjForcesL = new Chart(ctx, {
        type:'line',
        data: data_chrt,
        options: {
          plugins:{
              //legend: {
              //  display: false
              //}
              title: {
                display: true,
                text: 'Left force sensor',
                color: '#000',
                font: {
                        size: 20,
                    },
              }
         },
          elements: {
                    point:{
                        radius: 0
                    }
                },
          scales: {
            y: {
                max: 100,
                min: -100,
                ticks:{
                  maxTicksLimit: 11,
                }
            },
            x: {
              display: false,
            }
          },
        },
      });
      
      chartObjForcesL.options.transitions.active.animation.duration = 0;
      chartObjForcesL.options.animation = false;

      this.chartForceL = markRaw(chartObjForcesL)

      this.chartForceL;
    },

    chart_chart(){
      var values = this.chartForceR.data.datasets[0].data.slice(1);
      values.push(Math.floor(Math.random()*100))
      // for (let i = 0; i < 7; i++) {  
      //   values.push(Math.floor(Math.random()*100))
      // }
      this.chartForceR.data.datasets[0].data = values;
      console.log(this.chartForceR.data.datasets[0].data);
      var valuesX = this.chartForceR.data.labels.slice(1);
      valuesX.push(valuesX[valuesX.length-1]+1)
      this.chartForceR.data.labels = valuesX
      this.chartForceR.update();
    },

    createCharts(){
      this.createChartForceR()
      this.createChartForceL()
    },
    
  },

  mounted(){
    this.createCharts()
    this.url = 'ws://' + (((window.location.href).split("/")[2]).split(":")[0]) + ':9090';
    this.ros = new ROSLIB.Ros({
        url : this.url //'ws://192.168.43.168:9090'
    });
    console.log(this.ros)
    
    this.ros.on('connection', () => {
      console.log('Connected to websocket server.');
      this.rosCon = true
      this.init_subscribers();
    })

    this.ros.on('error', (error) => {
      console.log('Error connecting to websocket server: ', error);
      this.rosCon = false
      throw "Not connected";
    })

    this.ros.on('close', () => {
      this.rosCon = false
      console.log('Connection to websocket server closed.');
    })

    this.modeProp = 'Idle';
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
.canvas_container{
  max-height: 500px;
  width: 500px;
  margin: 30px;
}
.inline_items *{
  display: inline-block;
}
ul {
  list-style-type: none;
}
.centered_items{
  margin: auto;
}
.selection{
  margin:auto;
  width: 300px;
  min-width: fit-content;
  align-items: center;
  text-align: center;
  background-color: #49485e;
  border-radius: 15px;
  border: 2px solid #1d1b31;
  color:white;
}
.selection *{
  margin-top: 20px;
  margin-bottom: 20px;
  margin-right: 5px;
}
.selection label{
  margin-right: 20px;
}
li{
  margin:auto;
  width: 300px;
  min-width: fit-content;
  align-items: center;
  text-align: center;
}
</style>