// 全国普通高校列表（简化版）
export const universities = [
  { id: '110001', name: '北京大学', province: '北京' },
  { id: '110002', name: '清华大学', province: '北京' },
  { id: '110003', name: '中国人民大学', province: '北京' },
  { id: '110004', name: '北京师范大学', province: '北京' },
  { id: '110005', name: '北京航空航天大学', province: '北京' },
  { id: '110006', name: '北京理工大学', province: '北京' },
  { id: '110007', name: '中国农业大学', province: '北京' },
  { id: '110008', name: '中央民族大学', province: '北京' },
  { id: '110009', name: '北京交通大学', province: '北京' },
  { id: '110010', name: '北京工业大学', province: '北京' },
  { id: '120001', name: '南开大学', province: '天津' },
  { id: '120002', name: '天津大学', province: '天津' },
  { id: '310001', name: '复旦大学', province: '上海' },
  { id: '310002', name: '上海交通大学', province: '上海' },
  { id: '310003', name: '同济大学', province: '上海' },
  { id: '310004', name: '华东师范大学', province: '上海' },
  { id: '320001', name: '南京大学', province: '江苏' },
  { id: '320002', name: '东南大学', province: '江苏' },
  { id: '320003', name: '南京航空航天大学', province: '江苏' },
  { id: '320004', name: '南京理工大学', province: '江苏' },
  { id: '330001', name: '浙江大学', province: '浙江' },
  { id: '340001', name: '中国科学技术大学', province: '安徽' },
  { id: '350001', name: '厦门大学', province: '福建' },
  { id: '370001', name: '山东大学', province: '山东' },
  { id: '370002', name: '中国海洋大学', province: '山东' },
  { id: '410001', name: '郑州大学', province: '河南' },
  { id: '420001', name: '武汉大学', province: '湖北' },
  { id: '420002', name: '华中科技大学', province: '湖北' },
  { id: '430001', name: '湖南大学', province: '湖南' },
  { id: '430002', name: '中南大学', province: '湖南' },
  { id: '440001', name: '中山大学', province: '广东' },
  { id: '440002', name: '华南理工大学', province: '广东' },
  { id: '500001', name: '重庆大学', province: '重庆' },
  { id: '510001', name: '四川大学', province: '四川' },
  { id: '510002', name: '电子科技大学', province: '四川' },
  { id: '610001', name: '西安交通大学', province: '陕西' },
  { id: '610002', name: '西北工业大学', province: '陕西' },
  { id: '610003', name: '西北农林科技大学', province: '陕西' },
  { id: '620001', name: '兰州大学', province: '甘肃' },
  { id: '230001', name: '哈尔滨工业大学', province: '黑龙江' },
  { id: '220001', name: '吉林大学', province: '吉林' },
  { id: '210001', name: '大连理工大学', province: '辽宁' },
  { id: '210002', name: '东北大学', province: '辽宁' },
  { id: '450001', name: '广西大学', province: '广西' },
  { id: '520001', name: '贵州大学', province: '贵州' },
  { id: '460001', name: '海南大学', province: '海南' },
  { id: '130001', name: '河北工业大学', province: '河北' },
  { id: '410002', name: '河南大学', province: '河南' },
  { id: '230002', name: '哈尔滨工程大学', province: '黑龙江' },
  { id: '420003', name: '中国地质大学（武汉）', province: '湖北' },
  { id: '420004', name: '武汉理工大学', province: '湖北' },
  { id: '420005', name: '华中农业大学', province: '湖北' },
  { id: '420006', name: '华中师范大学', province: '湖北' },
  { id: '430003', name: '湖南师范大学', province: '湖南' },
  { id: '320005', name: '苏州大学', province: '江苏' },
  { id: '320006', name: '南京师范大学', province: '江苏' },
  { id: '360001', name: '南昌大学', province: '江西' },
  { id: '150001', name: '内蒙古大学', province: '内蒙古' },
  { id: '640001', name: '宁夏大学', province: '宁夏' },
  { id: '630001', name: '青海大学', province: '青海' },
  { id: '370003', name: '中国石油大学（华东）', province: '山东' },
  { id: '140001', name: '太原理工大学', province: '山西' },
  { id: '510003', name: '西南交通大学', province: '四川' },
  { id: '510004', name: '四川农业大学', province: '四川' },
  { id: '120003', name: '天津医科大学', province: '天津' },
  { id: '540001', name: '西藏大学', province: '西藏' },
  { id: '650001', name: '新疆大学', province: '新疆' },
  { id: '650002', name: '石河子大学', province: '新疆' },
  { id: '530001', name: '云南大学', province: '云南' },
  { id: '330002', name: '宁波大学', province: '浙江' },
]

// 按省份分组
export function groupUniversitiesByProvince() {
  const groups: Record<string, typeof universities> = {}
  universities.forEach(uni => {
    if (!groups[uni.province]) {
      groups[uni.province] = []
    }
    groups[uni.province].push(uni)
  })
  return groups
}

// 搜索大学
export function searchUniversities(keyword: string) {
  if (!keyword.trim()) return universities
  const lowerKeyword = keyword.toLowerCase()
  return universities.filter(uni =>
    uni.name.toLowerCase().includes(lowerKeyword) ||
    uni.id.includes(keyword)
  )
}
