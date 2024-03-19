// Material UI
import { Typography, Button } from '@mui/material';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import VideogameAssetOutlinedIcon from '@mui/icons-material/VideogameAssetOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';

export default function Home() {
    const buttonsList = [
        {
            icon: <AddBoxOutlinedIcon sx={{ fontSize: 70 }}/>,
            label: "Create Lobby",
            link: "/",
        },
        {
            icon: <VideogameAssetOutlinedIcon sx={{ fontSize: 70 }}/>,
            label: "Join Lobby",
            link: "/join-lobby",
        },
        {
            icon: <PeopleOutlineIcon sx={{ fontSize: 70 }}/>,
            label: "Friends",
            link: "/friends",
        }
    ]

    return (
        <div className="h-screen flex items-center justify-center">
            <div className="flex flex-col items-center space-y-10">
                <div className="flex flex-col items-center">
                    <Typography variant="h4">Highest Score</Typography>
                    <Typography variant="h2">1000</Typography>
                </div>
                <div className="flex justify-center space-x-12">
                    {buttonsList.map((data, index) => (
                        <div key={index} className="flex flex-col items-center space-y-2">
                            <Button variant="outlined" href={data.link} sx={{ borderRadius: 4 }} className="w-[100px] aspect-square flex items-center justify-center">
                                {data.icon}
                            </Button>
                            <Typography variant="subtitle1">{data.label}</Typography>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}