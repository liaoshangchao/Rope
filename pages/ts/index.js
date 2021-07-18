import { getDeviceDetails } from '../../utils/api/device-api';
import { getFamilyList } from '../../utils/api/family-api';
import BleService from '../../libs/ble-server';
import request from '../../utils/request';
import { dpIdMap } from '../../utils/ts_utils/config';
import {getStatiType} from '../../utils/api/statistics-api';

const BleConnectStatus = {
  notConnected: 'notConnected',
  connecting: 'connecting',
  connected: 'connected',
  connectionFailed: 'connectionFailed'
};

// 注入方法
BleService.initFunction(request);

Page({
  /**
   * 页面的初始数据
   */
  data: {
    device_name: '',
    bleInstance: null,
    bleConnectStatus: BleConnectStatus.notConnected,
    dpState: {},
    bleConnect: false,
    anniuShow:false,
    tsPauseValue:false,
    tsPauseText:"暂停",
    titlevalue:"加油",
    titletext:" ！",
    modetext:"请选择模式",
    valueOne:"0",
    valueTwo:"0",
    valueThr:"0",
    textOne:"个数",
    textTwo:"时间",
    textThr:"速度",
    dps: {},
    PopCountshow:false,
    PopCountvalue:100,
    PopTimeshow:false,
    PopTimevalue:0,
    fenvalues:[]
  },
  jumpTodeviceEditPage() {
    const { icon, device_id, device_name } = this.data;
    wx.navigateTo({
      url: `/pages/home_center/device_manage/index?device_id=${device_id}&device_name=${device_name}&device_icon=${icon}`
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function(options) {
    const { device_id , device_name } = options;

    const tsdetails = await getDeviceDetails(device_id);
    var icon = tsdetails.icon
    console.log(icon);
    var tsstatusList = tsdetails.status;
    var tslastmode = tsstatusList[2].value;
    var titlevalue = "0";
      var titletext = "！";
      var modetext = "自由跳";
      var valueOne = "0";
      var valueTwo = "0";
      var valueThr = "0";
      var textOne = "个数";
      var textTwo = "时间";
      var textThr = "速度";
    console.log(tsdetails);
    // 家庭id
    const owner_id = wx.getStorageSync('owner_id');

    // 抽象的蓝牙设备实例
    const instance = BleService.setNewInstance(device_id, owner_id);
    // 功能点实例化
    instance.set('_bleIotData', { _ble_dpCodeMap: dpIdMap });
    //连接蓝牙
    var aabb = await instance.connectBlue();
    console.log(aabb);
    // 监听蓝牙通信
    instance.revicePackage((parseReceiveData) => {
      const { type, status, dpState, deviceId} = parseReceiveData;
      console.log(type, status, dpState, deviceId);
      // this.setData({
      //   dpState,
      //   status,
      //   type,
      //   deviceId
      // });
      if (type === 'connect' && status === 'fail') {
        this.setData({
          anniuShow:false
        });
        if (deviceId) {
          return { msg: '连接失败 或 连接后又断开' }
        } else {
          return { msg: '未发现当前蓝牙设备' }
        }
        
      } else if (type === 'connect' && status === 'connecting') {
         //连接中，就是老是停在这个状态不动
        wx.showToast({
          title: '蓝牙连接中...',
          icon: 'error',
          duration: 2000
        });
        this.setData({
          anniuShow:false
        });
      } else if (type === 'connect' && status === 'connected') {
        // 连接成功
        wx.showToast({
          title: '蓝牙连接成功',
          icon: 'success',
          duration: 1000
        });
        this.setData({
          anniuShow:false
        });
      } else if (!(deviceId in parseReceiveData)) {
        // 一般为dp上报事件，可在此处处理数据or走业务逻辑
      if (dpState.target_count > 0){
        titlevalue = dpState.target_count
        titletext = "个"
        console.log(titlevalue)
      }
      if (dpState.target_time > 0){
        titlevalue = dpState.target_time
        titletext = "秒"
        console.log(titlevalue)
      }
      switch (dpState.mode) {
        case 'countdown_number': 
          modetext = "倒计数跳";
          valueOne = dpState.count_realtime;
          valueTwo = dpState.time_realtime;
          valueThr = dpState.speed_realtime;
          textOne = "剩余个数";
          textTwo = "已用时间";
          textThr = "当前速度";
          break;
        case 'countdown_time': 
          modetext = "倒计时跳";
          valueOne = dpState.count_realtime;
          valueTwo = dpState.time_realtime;
          valueThr = dpState.speed_realtime;
          textOne = "已跳个数";
          textTwo = "剩余时间";
          textThr = "当前速度";
          break;
        case 'free_jump': 
          titlevalue = "加油";
          titletext = "！";
          modetext = "自由跳";
          valueOne = dpState.count_realtime;
          valueTwo = dpState.time_realtime;
          valueThr = dpState.speed_realtime;
          textOne = "已跳个数";
          textTwo = "已用时间";
          textThr = "当前速度";
          break;
        default: {
          break;
        }
      }
      this.setData({
        titlevalue,
        titletext,
        modetext,
        valueOne,
        valueTwo,
        valueThr,
        textOne,
        textTwo,
        textThr,
        anniuShow:true
      });
    }
    });
    var fenvalues = ['1', '2', '3', '4', '5','6'];
    this.setData({
      device_name,
      device_id,
      icon,
      bleInstance: instance,
      Timecolumns: [
        // 第一列
        {
          values: fenvalues,
          defaultIndex: 1
        },
        // 第二列
        {
          values: ['00', '15', '30', '45'],
          defaultIndex: 0
        }
      ]
    });
  },
  /**
   * 生命周期函数--监听页面卸载,销毁蓝牙实例
   */
  onUnload: function () {
    const { device_id } = this.data;
    BleService.destroyInstance(device_id);
  },


  // 下发指令，设置本次跳绳模式为 计数 模式
  sendModCount: function() {
    const { bleInstance } = this.data;
    if (bleInstance) {
      bleInstance.sendDp({ dpCode: 'mode', dpValue: 'countdown_number' });
      this.setData({
        PopCountshow: true
      });
    }
  },
  // 下发指令，设置本次跳绳模式为 计时 模式
  sendModTime: function() {
    const { bleInstance } = this.data;
    if (bleInstance) {
      bleInstance.sendDp({ dpCode: 'mode', dpValue: 'countdown_time' });
      this.setData({
        PopTimeshow: true
      });
    }
  },


  sendModFree: function() {
    const { bleInstance } = this.data;
    if (bleInstance) {
      bleInstance.sendDp({ dpCode: 'mode', dpValue: 'free_jump' });
    }
  },

  //暂停按钮
  tspause: function() {
    var {tsPauseValue} = this.data;
    if (tsPauseValue){
      this.sendtsGo();
      this.setData({
        tsPauseValue: false,
        tsPauseText:"暂停"
      });
    }else {
      this.sendtsPause();
      this.setData({
        tsPauseValue: true,
        tsPauseText:"继续"
      });
    } 
  },
  
  // 下发指令，开始
  sendtsStart: function() {
    const { bleInstance } = this.data;
    if (bleInstance) {
      bleInstance.sendDp({ dpCode: 'start', dpValue: true });
      bleInstance.sendDp({ dpCode: 'pause', dpValue: false });
    }
  },
  // 下发指令，结束
  sendtsStop: function() {
    const { bleInstance } = this.data;
    if (bleInstance) {
      bleInstance.sendDp({ dpCode: 'start', dpValue: false });
    }
  },
  // 下发指令，暂停
  sendtsPause: function() {
    const { bleInstance } = this.data;
    if (bleInstance) {
      bleInstance.sendDp({ dpCode: 'pause', dpValue: true });
    }
  },
  // 下发指令，继续
  sendtsGo: function() {
    const { bleInstance } = this.data;
    if (bleInstance) {
      bleInstance.sendDp({ dpCode: 'pause', dpValue: false });
    }
  },
  // 蓝牙连接
  connect: function() {
    const { bleInstance } = this.data;
    bleInstance.connectBlue();
  },
  //Stepper值改变
  onCountChange(event) {
    var PopCountvalue = event.detail;
    console.log(PopCountvalue);
    this.setData({
      PopCountvalue
    });
    
  },
  //PopCount弹出层关闭
  onPopCountClose(){
    this.setData({
      PopCountshow: false
    });
  },
  //点击弹出层确定按钮
  PopCountConfim(){
    const { bleInstance, PopCountvalue } = this.data;
    if (bleInstance) {
      bleInstance.sendDp({ dpCode: 'target_count', dpValue: PopCountvalue });
    }
    this.setData({
      PopCountshow: false
    });
  },
  //关闭Time弹出层
  onPopTimeClose(){
    this.setData({
      PopTimeshow: false
    });
  },
  onPopTimeCancel(){
    this.setData({
      PopTimeshow: false
    });
  },
  //Time弹出层点击确定
  onPopTimeConfirm(event){

    var PopTimevalue = Number(event.detail.value[0]*60)+Number(event.detail.value[1]);

    const { bleInstance } = this.data;
    if (bleInstance) {
      bleInstance.sendDp({ dpCode: 'target_time', dpValue: PopTimevalue });
    }
    this.setData({
      PopTimevalue,
      PopTimeshow: false
    });
  }
});
