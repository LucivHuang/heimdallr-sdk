module.exports = {
    parser: '@typescript-eslint/parser', //定义ESLint的解析器
    parserOptions: {
      ecmaVersion: 'latest',
      project: ['tsconfig.json']
    },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    plugins: ['@typescript-eslint', 'html'],
    env: {
      browser: true,
      node: true
    },
    // 0:off 1:warning 2:error
    rules: {
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-empty-function': 0,
      '@typescript-eslint/ban-types': 0,
      // 不允许在不合适的地方使用 Promise 值
      '@typescript-eslint/no-misused-promises': 2,
      '@typescript-eslint/ban-ts-comment': [2, { 'ts-expect-error': false, 'ts-ignore': true, 'ts-nocheck': true, 'ts-check': false }],
      '@typescript-eslint/explicit-module-boundary-types': 0,
      // 不允许 for-in Array
      '@typescript-eslint/no-for-in-array': 2,
      '@typescript-eslint/prefer-for-of': 2,
      // 避免非必要的布尔值比较
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 2,
      // switch 语句需要覆盖所有可能情况
      '@typescript-eslint/switch-exhaustiveness-check': 2,
      // 禁止将没有 await 的函数标记为 async
      '@typescript-eslint/require-await': 2,
      // 不允许给能自动推断出类型的 primitive 类型变量额外添加类型声明
      '@typescript-eslint/no-inferrable-types': 2,
      // 不允许在范型和返回值之外的地方使用 void 类型
      '@typescript-eslint/no-invalid-void-type': 2,
      // 不可变的私有属性标记成 readonly
      '@typescript-eslint/prefer-readonly': ['error', { onlyInlineLambdas: true }]
    }
  }
  