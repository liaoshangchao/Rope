// miniprogram/pages/home_center/common_panel/index.js.js
import { getDevFunctions, getDeviceDetails, deviceControl ,getElectricity,getTotalElectricity,getDayElectricity} from '../../../utils/api/device-api'
import wxMqtt from '../../../utils/mqtt/wxMqtt'
let {dcOn,dcOff,power,powerOff,schedule,statistics,timer,bgImage} = require('./img') 


Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusCount: 0,
    loading: true,
    device_name: '',
    titleItem: {
      name: '',
      value: '',
    },
    
    roDpList: {}, //只上报功能点
    rwDpList: {}, //可上报可下发功能点
    isRoDpListShow: false,
    isRwDpListShow: false,
    imgList:{dcOn,dcOff,power,powerOff,schedule,statistics,timer,bgImage}

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { device_id } = options
    this.setData({ device_id })
    
    // console.log(options);
    // console.log(device_id);

    // mqtt消息监听
    wxMqtt.on('message', (topic, newVal) => {
      const { status } = newVal
      this.updateStatus(status)
      console.log(status);
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: async function () {
    const { device_id } = this.data
    const [{ name, status, icon }, { functions = [] }] = await Promise.all([
      getDeviceDetails(device_id),
      getDevFunctions(device_id),
    ]);
    // console.log(device_id);
    this.setData({
      loading: false
    })

    //自定义toast的调用
    this.toast = this.selectComponent("#toast");

    //获得上传下发list
    const { roDpList, rwDpList } = this.reducerDpList(status, functions)

    // 获取头部展示功能点信息
    let titleItem = {
      name: '',
      value: '',
    };
    if (Object.keys(roDpList).length > 0) {
      let keys = Object.keys(roDpList)[0];
      titleItem = roDpList[keys];
    } else {
      let keys = Object.keys(rwDpList)[0];
      titleItem = rwDpList[keys];
    }

    const roDpListLength = Object.keys(roDpList).length
    const isRoDpListShow = Object.keys(roDpList).length > 0
    const isRwDpListShow = Object.keys(rwDpList).length > 0

    this.setData({ titleItem, roDpList, rwDpList, device_name: name, isRoDpListShow, isRwDpListShow, roDpListLength, icon })
  },

  // 分离只上报功能点，可上报可下发功能点
  reducerDpList: function (status, functions) {
    // 处理功能点和状态的数据
    let roDpList = {};
    let rwDpList = {};
    if (status && status.length) {
      status.map((item) => {
        const { code, value } = item;
        let isExit = functions.find(element => element.code == code);
        if (isExit) {
          let rightvalue = value
          // 兼容初始拿到的布尔类型的值为字符串类型
          if (isExit.type === 'Boolean' && typeof value === 'string') {
            rightvalue = value === 'true'
          }
          rwDpList[code] = {
            code,
            value: rightvalue,
            type: isExit.type,
            values: isExit.values,
            name: isExit.name,
          };
        } else {
          roDpList[code] = {
            code,
            value,
            name: code,
          };
        }
      });
    }
    return { roDpList, rwDpList }
  },

  sendDp: function (dpCode, value) {
    const { device_id } = this.data
    deviceControl(device_id, dpCode, value)
  },

  updateStatus: function (newStatus) {
    let { roDpList, rwDpList, titleItem } = this.data

    newStatus.forEach(item => {
      const { code, value } = item

      if (typeof roDpList[code] !== 'undefined') {
        roDpList[code]['value'] = value;
      } else if (rwDpList[code]) {
        rwDpList[code]['value'] = value;
      }
    })

    // 更新titleItem
    if (Object.keys(roDpList).length > 0) {
      let keys = Object.keys(roDpList)[0];
      titleItem = roDpList[keys];
    } else {
      let keys = Object.keys(rwDpList)[0];
      titleItem = rwDpList[keys];
    }

    this.setData({ titleItem, roDpList: { ...roDpList }, rwDpList: { ...rwDpList } })
  },


  //获得当前设备状态
  turnDeviceOn: function (e) {
    const { value } = this.data.rwDpList.switch;
    this.sendDp('switch', !value);
    console.log(this.data.rwDpList.switch);
  },

  // // 待开发功能
  // turnNoticeOn: function () {
  //   this.toast.showToast('功能待开发~');
  // },


  //倒计时
  turnCountDown: function (event) {
    
    const { device_id } = this.data         //获取设备的ID
    this.sendDp( 'countdown_1', 10) ;    //根据DP点，发送数据

  },
  
  //定时功能
  changeTime:function (event) {
    var time_t;
    time_t = event.detail.value;            //获取时间选择的值
    var hour = time_t.split(':')[0];        //将小时分离出
    var min = time_t.split(':')[1];         //将分钟数据分离出
    var stime = parseInt(hour) *3600 + parseInt(min)*60;    //转换为秒数

    // var stime = new Date().getTime(time_t)-1620204000000;
    const { device_id } = this.data         //获取设备的ID
    this.sendDp( 'countdown_1', stime) ;    //根据DP点，发送数据
    // console.log(stime);
  },

  //查询用电量 --  页面跳转（电量统计数据报表）
  gotoOtherage: function (options) {
    const { icon, device_id, device_name } = this.data
    wx.navigateTo({
      url: `/pages/home_center/echarsDemo/index?device_id=${device_id}&device_name=${device_name}&device_icon=${icon}`,
    })
  },

  //设备信息查询修改 --  页面跳转
  jumpTodeviceEditPage: function () {
    const { icon, device_id, device_name } = this.data
    wx.navigateTo({
      url: `/pages/home_center/device_manage/index?device_id=${device_id}&device_name=${device_name}&device_icon=${icon}`,
    })
  }


})

