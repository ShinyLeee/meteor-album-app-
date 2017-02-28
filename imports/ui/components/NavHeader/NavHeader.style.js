import styled from 'styled-components';

export const Wrapper = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  box-shadow: 0 1px 8px rgba(0,0,0,.3);
  z-index: 1100;
`;

export const styles = {
  AppBarTitle: {
    fontSize: '20px',
    fontFamily: 'Microsoft Yahei',
    cursor: 'pointer',
  },
  AppBarIconElementRight: {
    marginTop: 0,
    marginRight: 0,
  },
  AppBarIcon: {
    top: '4px',
  },
  AppBarIconSvg: {
    width: '28px',
    height: '28px',
    color: '#fff',
  },
  AppBarIconBtnForAvatar: {
    left: '10px',
    top: '8px',
    padding: 0,
  },
  AppBarIconBtnForLogin: {
    top: '8px',
    marginRight: '12px',
  },
  AppBarLoginBtn: {
    margin: '12px 0 0 0',
    color: '#fff',
  },
};
