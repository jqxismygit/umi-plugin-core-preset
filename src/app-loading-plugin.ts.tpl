export const qiankun = {
  async bootstrap(props) {
    props?.setAppLoading(true);
  },
  async mount(props) {
    setTimeout(() => {
      props?.setAppLoading(false);
    }, 1000);
  },
  async unmount(props) {
    props?.setAppLoading(true);
  },
};
