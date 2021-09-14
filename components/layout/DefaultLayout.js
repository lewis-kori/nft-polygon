import NavBar from '../ui/NavBar';
const DefaultLayout = (props) => {
  return (
    <div>
      <NavBar />
      {props.children}
    </div>
  );
};

export default DefaultLayout;
