import { GetServerSideProps } from "next";

const Page = () => {
    return <div>Admin Dashboard</div>;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    return {
        props: {},
    };
};

export default Page;
