// 接口名字：ImportMetaEnv，专门表示import.meta.env里面的有哪些属性及其类型
interface ImportMetaEnv {
  // readonly表示该属性是只读的，不能被修改。
  readonly VITE_LLM_BASE_URL: string
  readonly VITE_LLM_API_KEY: string
  readonly VITE_LLM_MODEL: string
}
// ImportMeta 是 TypeScript 里对 import.meta 这个对象的类型描述。
interface ImportMeta {
  readonly env: ImportMetaEnv
}
