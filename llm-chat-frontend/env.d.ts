/// <reference types="vite/client" />

// 接口名字：ImportMetaEnv，专门表示import.meta.env里面的有哪些属性及其类型
interface ImportMetaEnv {
  // readonly表示该属性是只读的，不能被修改。
  readonly VITE_API_BASE_URL: string
  // 默认模型名称，页面初始化时会先用它
  readonly VITE_LLM_MODEL: string
}

// ImportMeta 是 TypeScript 里对 import.meta 这个对象的类型描述。
interface ImportMeta {
  readonly env: ImportMetaEnv
}
