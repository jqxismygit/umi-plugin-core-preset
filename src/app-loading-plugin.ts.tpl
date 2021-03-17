export const qiankun = {
  async bootstrap(props) {
    props?.setAppLoading(true);
  },
  async mount(props) {
    setTimeout(() => {
      props?.setAppLoading(false);
    }, 200);
  },
  async unmount(props) {
  },
};
