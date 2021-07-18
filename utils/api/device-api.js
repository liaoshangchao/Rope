import request from '../request'
// request 做了自动向params中添加uid的操作，因此可以不带入uid

// 获取mqtt配置
export const getMqttconfig = () => {
  return request({
    name: 'ty-service',
    data: {
      action: 'device.openHubConfig',
      params: {
        link_id: Math.random()
          .toString(10)
          .substring(2, 11),
        link_type: 'websocket'
      }
    }
  })
}

// 获取设备列表 
export const getDeviceList = () => {
  return request({
    name: 'ty-service',
    data: {
      action: 'device.getDeviceList',
      params: {}
    }
  })
}

// 获取设备最新状态
export const getDeviceStatus = (device_id) => {
  return request({
    name: 'ty-service',
    data: {
      action: 'device.status',
      params: {
        device_id
      }
    }
  })
}

// 获取设备指令集
export const getDeviceSpecifications = (device_id) => {
  return request({
    name: 'ty-service',
    data: {
      action: 'device.specifications',
      params: {
        device_id
      }
    }
  })
}

// 获取设备指令集(带中文dp名称)
export const getDevFunctions = (device_id) => {
  return request({
    name: 'ty-service',
    data: {
      action: 'device.functions',
      params: {
        device_id
      }
    }
  })
}

// 获取设备指令集(带中文dp名称)
export const getDeviceDetails = (device_id) => {
  return request({
    name: 'ty-service',
    data: {
      action: 'device.details',
      params: {
        device_id
      }
    }
  })
}


// 指令下发
export const deviceControl = (device_id, code, value) => {
  return request({
    name: 'ty-service',
    data: {
      action: 'device.control',
      params: {
        device_id,
        commands: [
          {
            code,
            value
          }
        ]
      }
    }
  })
}

// 获取 ticket
export const reqTicket = () =>
  request({
    name: 'ty-service',
    data: {
      action: 'system.userTicket',
      params: {}
    }
  });

// 移除设备
export const deleteDevice = (devId) => 
  request({
    name: 'ty-service',
    data: {
      action: 'device.remove',
      params: { device_id: devId}
    }
  });

  //按小时查询用电量
export const getHourElectricity = (device_id,code,start_hour,end_hour) =>{
  return request({
    name: "ty-service",
    data:{
      action: "statistics.hours",
      params: {
        device_id,
        code,
        start_hour,
        end_hour

      }
    }
  })
}

//按天查询用电量
export const getDayElectricity = (device_id,code,start_day,end_day) =>{
  return request({
    name: "ty-service",
    data:{
      action: "statistics.days",
      params: {
        device_id,
        code,
        start_day,
        end_day

      }
    }
  })
}

//按周查询用电量
export const getWeekElectricity = (device_id,code,start_week,end_week) =>{
  return request({
    name: "ty-service",
    data:{
      action: "statistics.weeks",
      params: {
        device_id,
        code,
        start_week,
        end_week
      }
    }
  })
}

//按月查询用电量
export const getMonthElectricity = (device_id,code,start_month,end_month) =>{
  return request({
    name: "ty-service",
    data:{
      action: "statistics.months",
      params: {
        device_id,
        code,
        start_month,
        end_month
      }
    }
  })
}

//按历史总查询用电量
export const getTotalElectricity = (device_id,code) =>{
  return request({
    name: "ty-service",
    data:{
      action: "statistics.total",
      params: {
        device_id,
        code
      }
    }
  })
}

//移除设备
export const RemoveDevice = (device_id) =>{
  return request({
    name: "ty-service",
    data:{
      action: "device.remove",
      params: {
        device_id,
      }
    }
  })
}

//修改设备名字
export const ChangeDeviceName = (device_id,name) =>{
  return request({
    name: "ty-service",
    data:{
      action: "device.name",
      params: {
        device_id,
        name
      }
    }
  })
}

//修改设备名字
export const RestDevice = (device_id) =>{
  return request({
    name: "ty-service",
    data:{
      action: "device.reset-factory",
      params: {
        device_id,
      }
    }
  })
}

