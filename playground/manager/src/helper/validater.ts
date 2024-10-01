/**
 * 验证手机号是否合法
 * @param {string} value 手机号码
 * @return {boolean}
 */
export const validatePhone = (value: string): boolean => {
  const phone = value.replace(/\s/g, "");
  // 校验手机号，号段主要有(不包括上网卡)：130~139、150~153，155~159，180~189、170~171、176~178。14号段为上网卡专属号段
  const regs = /^((13[0-9])|(17[0-1,6-8])|(15[^4,\\D])|(18[0-9]))\d{8}$/;
  if (value.length == 0) {
    return false;
  } else {
    return regs.test(phone);
  }
};
