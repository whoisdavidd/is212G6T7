
// "use client";
// import React from 'react';
// import Box from '@mui/material/Box';
// import Drawer from '@mui/material/Drawer';
// import Toolbar from '@mui/material/Toolbar';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import ListItemIcon from '@mui/material/ListItemIcon';
// import ListItemText from '@mui/material/ListItemText';
// import Divider from '@mui/material/Divider';
// import Typography from '@mui/material/Typography';
// import HelpIcon from '@mui/icons-material/Help';
// import LogoutIcon from '@mui/icons-material/Logout';
// import DashboardIcon from '@mui/icons-material/Dashboard';
// import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
// import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
// import AssignmentIcon from '@mui/icons-material/Assignment';
// import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
// import BarChartIcon from '@mui/icons-material/BarChart';

// // Define sidebar width
// const drawerWidth = 240;

// function Sidebar() {
//   return (
//     <Drawer
//       variant="permanent"
//       sx={{
//         width: drawerWidth,
//         flexShrink: 0,
//         [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
//         backgroundColor: '#f7f7f7',
//       }}
//     >
//       <Toolbar>
//         <Typography variant="h6" noWrap component="div">
//           <Box sx={{ display: 'flex', alignItems: 'center' }}>
//             <img src="/logo.png" alt="logo" style={{ marginRight: 8 }} />
//             WorkNest
//           </Box>
//         </Typography>
//       </Toolbar>

//       <List>
//         <ListItem button>
//           <ListItemIcon>
//             <DashboardIcon />
//           </ListItemIcon>
//           <ListItemText primary="Dashboard" />
//         </ListItem>

//         <ListItem button>
//           <ListItemIcon>
//             <FitnessCenterIcon />
//           </ListItemIcon>
//           <ListItemText primary="Workout" />
//         </ListItem>

//         <ListItem button>
//           <ListItemIcon>
//             <RestaurantMenuIcon />
//           </ListItemIcon>
//           <ListItemText primary="Diet Plan" />
//         </ListItem>

//         <ListItem button>
//           <ListItemIcon>
//             <AssignmentIcon />
//           </ListItemIcon>
//           <ListItemText primary="Goals" />
//         </ListItem>

//         <ListItem button>
//           <ListItemIcon>
//             <CalendarTodayIcon />
//           </ListItemIcon>
//           <ListItemText primary="My Schedule" />
//         </ListItem>

//         <ListItem button>
//           <ListItemIcon>
//             <BarChartIcon />
//           </ListItemIcon>
//           <ListItemText primary="Progress" />
//         </ListItem>
//       </List>

//       <Divider />

//       <List>
//         <ListItem button>
//           <ListItemIcon>
//             <HelpIcon />
//           </ListItemIcon>
//           <ListItemText primary="Help" />
//         </ListItem>

//         <ListItem button>
//           <ListItemIcon>
//             <LogoutIcon />
//           </ListItemIcon>
//           <ListItemText primary="Logout" />
//         </ListItem>
//       </List>
//     </Drawer>
//   );
// }
// Mine
import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import FontAwesome for icons

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul className="sidebar-menu">
        <li>
          <i className="fas fa-th-large"></i> Dashboard
        </li>
        <li>
          <i className="fas fa-dumbbell"></i> Workout
        </li>
        <li>
          <i className="fas fa-utensils"></i> Diet Plan
        </li>
        <li>
          <i className="fas fa-bullseye"></i> Goals
        </li>
        <li>
          <i className="fas fa-calendar-alt"></i> My Schedule
        </li>
        <li>
          <i className="fas fa-chart-line"></i> Progress
        </li>
      </ul>
      <div className="sidebar-footer">
        <a href="#help">
          <i className="fas fa-question-circle"></i> Help
        </a>
        <a href="#logout">
          <i className="fas fa-sign-out-alt"></i> Logout
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
