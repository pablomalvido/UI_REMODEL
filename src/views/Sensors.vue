<template>
  <div>
    <TitlePage page='Sensors'/>
  </div>
  <div class="content">

    <div class="selection">
    <div class ="inline_items">
      <div v-for="(sensor, key) in sensors" :key="key" class = "checkbox_item">
      <input type="checkbox" :id="sensor.name" :value="sensor.name" v-model="checkedCharts" @click="check_graph(sensor)">
      <label :for="sensor.name">{{sensor.title}}</label>
      </div>
    </div>
    </div>

    <ul>
      <li>
        <div class ="inline_items">
          <div v-for="(sensor, key) in sensors" :key="key">
            <div v-if="checkedCharts.includes(sensor.name)">
              <div class="canvas_container" v-if="sensor.type=='0'">
                <canvas :id="sensor.id"></canvas>
              </div>
              <div class="canvas_container_square" v-if="sensor.type=='1'">
                <canvas :id="sensor.id"></canvas>
              </div>
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
      rosCon: false,
      modeProp: '',
      role: this.$route.params.role,
      sensors: { //types - 0: time chart, 1: xy chart
        1: {name: 'FL', id: 'chartForceL', type: 0, title: "Left force sensor", limits_y:[-10,10], labels:['Fx','Fy','Fz','Tx','Ty','Tz'], topic:'left_norbdo/forces', msg:'UI_nodes_pkg/sensorT'},
        2: {name: 'FR', id: 'chartForceR', type: 0, title: "Right force sensor", limits_y:[-10,10], labels:['Fx','Fy','Fz','Tx','Ty','Tz'], topic:'right_norbdo/forces', msg:'UI_nodes_pkg/sensorT'},
        3: {name: 'TL', id: 'chartTactileL', type: 1, title: "Left tactile sensor", limits_xy:[0,6,0,6], topic:'sensors/tactile_left', msg:'UI_nodes_pkg/sensorXY'},
        4: {name: 'TR', id: 'chartTactileR', type: 1, title: "Right tactile sensor", limits_xy:[0,6,0,6], topic:'sensors/tactile_right', msg:'UI_nodes_pkg/sensorXY'},
      },
      checkedCharts: [],
      chartObjList: {},
      sensor_topics: [],
    }
  },

  methods: {

    init_subscribers(){
      for (const [key, el] of Object.entries(this.sensors)) {
        this.sensor_topics[key.toString()] = new ROSLIB.Topic({
          ros : this.ros,
          name : el.topic,
          messageType : el.msg
        });
        if(el.type=="0"){
          this.sensor_topics[key.toString()].subscribe((message) => {
            for (let i = 0; i < message.data.length; i++) {  
              var values = this.chartObjList[el.id].data.datasets[i].data.slice(1);
              values.push(message.data[i])
              this.chartObjList[el.id].data.datasets[i].data = values;
            }
            var valuesX = this.chartObjList[el.id].data.labels.slice(1);
            valuesX.push(valuesX[valuesX.length-1]+1)
            this.chartObjList[el.id].data.labels = valuesX
            this.chartObjList[el.id].update();
          });
        }
        else if(el.type=="1"){
          this.sensor_topics[key.toString()].subscribe((message) => {
            this.chartObjList[el.id].data.labels = message.x
            this.chartObjList[el.id].data.datasets[0].data = message.y
            this.chartObjList[el.id].update();
          });
        }
      }
    },

    stop_subscribers(){
      for (const [key, value] of Object.entries(this.sensor_topics)) {
        if (value){
          value.unsubscribe();
        }
      }
    },

    check_graph(sensor){
      if (!(this.checkedCharts.includes(sensor.name))){
        console.log("Creating")
        setTimeout(() => {
          if(sensor.type==0){
            this.createChartTime(sensor.id, sensor.title, sensor.limits_y[0], sensor.limits_y[1], sensor.labels)
          }
          else if(sensor.type==1){
            this.createChartXY(sensor.id, sensor.title, sensor.limits_xy[0], sensor.limits_xy[1], sensor.limits_xy[2], sensor.limits_xy[3])
          }
        }, 50)
      }
      else{
        console.log("Destroying")
        this.chartObjList[sensor.id].destroy()
      }
    },

    base10toBase255(number) {
    const base = 255;
    const result = [];

    while (number > 0) {
        const remainder = number % base;
        result.unshift(remainder);
        number = Math.floor(number / base);
    }

    return result;
    },


    createChartTime(chart_id, chart_title, min_y, max_y, chart_labels){
      const ctx = document.getElementById(chart_id);
      var labels = [];
      var y_values = [];
      for (let i = 0; i < 51; i++) {  
        labels.push(i)
        y_values.push(0)
      }
      var data_chrt = {
        labels: labels,
        datasets: []
      };

      var color_sum = 0
      var color_jump = parseInt((255**3)/(chart_labels.length+1))
      var i=0
      for (const [key, label] of Object.entries(chart_labels)) {
        color_sum += color_jump
        var color_i = this.base10toBase255(color_sum)
        var color_label = 'rgb(' + color_i[0] + ','+ color_i[1] +','+ color_i[2] +')'
        data_chrt.datasets.push({label: label, data: y_values, fill: false, borderColor: color_label, tension: 0.1})
        i+=1
      }

      const chartTimeObj = new Chart(ctx, {
        type:'line',
        data: data_chrt,
        options: {
          plugins:{
              //legend: {
              //  display: false
              //}
              title: {
                display: true,
                text: chart_title,
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
                max: max_y,
                min: min_y,
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
      
      chartTimeObj.options.transitions.active.animation.duration = 0;
      chartTimeObj.options.animation = false;

      this.chartObjList[chart_id] = markRaw(chartTimeObj)

      this.chartObjList[chart_id];
    },


    createChartXY(chart_id, chart_title, min_x, max_x, min_y, max_y){
      const ctx = document.getElementById(chart_id);
      var labels = [];
      var y_values = [];
      for (let i = 0; i < 61; i++) {  
        labels.push(i)
        y_values.push(0)
      }
      var data_chrt = {
        labels: labels,
        datasets: [{label: 'x', data: y_values, fill: false, borderColor: 'rgb(192, 75, 75)', tension: 0.2}]
      };

      const chartXYObj = new Chart(ctx, {
        type:'line',
        data: data_chrt,
        options: {
          plugins:{
              legend: {
                display: false
              },
              title: {
                display: true,
                text: chart_title,
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
                max: max_y,
                min: min_y,
                display: true,
                border:{
                  display: true
                },
                grid:{
                  display: true,
                  drawOnChartArea: true,
                  drawTicks: false,
                },
                ticks:{
                  display: false,
                }
            },
            x: {
              max: max_x,
              min: min_x,
              display: true,
              border:{
                display: true
              },
              grid:{
                display: true,
                drawOnChartArea: true,
                drawTicks: false,
              },
              ticks:{
                display: false,
              }
            }
          },
        },
      });
      
      chartXYObj.options.transitions.active.animation.duration = 0;
      chartXYObj.options.animation = false;
      chartXYObj.options.maintainAspectRatio = false;

      this.chartObjList[chart_id] = markRaw(chartXYObj)

      this.chartObjList[chart_id];
    },

    createCharts(){
      for (const [key, el] of Object.entries(this.sensors)) {
        if(el.type=="0"){
          this.createChartTime(el.id, el.title, el.limits_y[0], el.limits_y[1], el.labels)
        }
        else if(el.type=="1"){
          this.createChartXY(el.id, el.title, el.limits_xy[0], el.limits_xy[1], el.limits_xy[2], el.limits_xy[3])
        }
      }
    },
    
  },

  beforeMount(){
    //Populate the variables
    for (const [key, el] of Object.entries(this.sensors)) {
      this.checkedCharts.push(el.name)
    }
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
    this.stop_subscribers()
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
  max-height: 700px;
  width: 700px;
  margin: 30px;
}
.canvas_container_square{
  height: 400px;
  width: 400px;
  margin: 62px;
  position: relative;
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
  padding-left: 20px;
  padding-right: 10px;
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
.checkbox_item {
  padding: 0px;
  margin: 0px;
}
li{
  margin:auto;
  width: 300px;
  min-width: fit-content;
  align-items: center;
  text-align: center;
}
</style>