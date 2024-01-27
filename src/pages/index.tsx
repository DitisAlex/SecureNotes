import Login from '../components/login';
import Upload from '../components/upload';
import Loader from '../components/loader'
import { useSession } from 'next-auth/react';

const Home = (): JSX.Element => {
	const { data: sessionData } = useSession();
	return (
		<>
			{sessionData === undefined
				? <Loader />
				: <div className="bg-[--surface-color-secondary]">
					{sessionData ? <Upload /> : <Login />}
				</div >
			}
		</>
	);
};

export default Home;
