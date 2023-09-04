export const App = {
  name: "App",
  template: `<div>hello, {{ message }}</div>`,
  setup() {
    return {
      message: 'world'
    }
  }
}