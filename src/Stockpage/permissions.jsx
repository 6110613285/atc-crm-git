export const ROLE_PERMISSIONS = {
  admin: {
    label: 'Administrator',
    description: 'เข้าถึงทุกระบบและจัดการผู้ใช้งานได้',
    color: '#D32F2F', // สีแดงเข้ม
    pages: [
      { name: 'crmsystem', code: '01', label: 'CRM System', required: false },
      { name: 'warehousesystem', code: '02', label: 'Warehouse System', required: false },
      { name: 'product', code: '03', label: 'Product', required: false },
      { name: 'adminuser', code: '04', label: 'Admin User', required: false },
      // เพิ่มสิทธิ์อื่นๆ ที่ admin ควรมี
    ],
  },
  user: {
    label: 'User',
    description: 'เข้าถึงระบบพื้นฐานตามที่ได้รับสิทธิ์',
    color: '#42A5F5', // สีน้ำเงิน
    pages: [
      { name: 'crmsystem', code: '01', label: 'CRM System', required: false },
      { name: 'warehousesystem', code: '02', label: 'Warehouse System', required: false },
      { name: 'product', code: '03', label: 'Product', required: false },
      { name: 'adminuser', code: '04', label: 'Admin User', required: false },
      // สิทธิ์เหล่านี้เป็น false เพราะ admin อาจจะกำหนดให้ user บางคนเท่านั้นถึงจะเข้าถึงได้
    ],
  },
  // สามารถเพิ่ม role อื่นๆ ได้ตามต้องการ
  // sales: { ... },
  // support: { ... }
};

// Map สำหรับแปลง code เป็น name และ name เป็น code
const codeToNameMap = {};
const nameToCodeMap = {};

// สร้าง map จาก ROLE_PERMISSIONS
Object.values(ROLE_PERMISSIONS).forEach(role => {
  role.pages.forEach(page => {
    if (!codeToNameMap[page.code]) { // หลีกเลี่ยงการเขียนทับหาก code ซ้ำกันใน role ที่ต่างกัน
      codeToNameMap[page.code] = page.name;
    }
    if (!nameToCodeMap[page.name]) {
      nameToCodeMap[page.name] = page.code;
    }
  });
});

/**
 * แปลง Array ของรหัสสิทธิ์ (codes) เป็น Array ของชื่อสิทธิ์ (names)
 * @param {string[]} codes - Array ของรหัสสิทธิ์ เช่น ['01', '03']
 * @returns {string[]} Array ของชื่อสิทธิ์ เช่น ['crmsystem', 'product']
 */
export const getPermissionNames = (codes) => {
  if (!Array.isArray(codes)) {
    console.error("getPermissionNames: Input must be an array of codes.");
    return [];
  }
  return codes.map(code => codeToNameMap[code]).filter(name => name !== undefined);
};

/**
 * แปลง Array ของชื่อสิทธิ์ (names) เป็น Array ของรหัสสิทธิ์ (codes)
 * @param {string[]} names - Array ของชื่อสิทธิ์ เช่น ['crmsystem', 'product']
 * @returns {string[]} Array ของรหัสสิทธิ์ เช่น ['01', '03']
 */
export const getPermissionCodes = (names) => {
  if (!Array.isArray(names)) {
    console.error("getPermissionCodes: Input must be an array of names.");
    return [];
  }
  return names.map(name => nameToCodeMap[name]).filter(code => code !== undefined);
};