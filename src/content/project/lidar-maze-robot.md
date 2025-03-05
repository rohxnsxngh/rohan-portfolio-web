---
title: "LiDAR Driven Maze Robot"
date: "2024-01-15"
status: "completed"
image: "/images/project/MazeBotModel.png"
description: "An advanced robotic system capable of autonomously navigating complex mazes using LiDAR technology and sophisticated control algorithms."
tags: ["robotics", "LiDAR", "autonomous systems", "ROS", "Python", "C++"]
github: "https://github.com/rohan/maze-bot"
---

# LiDAR Driven Maze Bot: A Technical Exploration of Autonomous Robotics

The LiDAR Driven Maze Bot project, undertaken by the Texas A&M University Robotics team under my leadership, aimed to develop an advanced robotic system capable of autonomously navigating complex mazes. This initiative focused on integrating cutting-edge mechanical and software engineering techniques to enhance the robot's capabilities while maintaining a relatively cheap budget for the project.

## Hardware Enhancements

In the maze robot, the integration of motors and encoders plays a crucial role in enhancing its navigational capabilities:

- High torque 750Kv motors for enhanced rotational force
- 8192 CPR encoders for precise position tracking
- ODrive 3.6 motor controller for dynamic velocity profiles
- DC voltage step-down converter for stable power distribution
- Jetson WiFi Module for improved communication

## Mechanical Design and Fabrication

The mechanical design focused on optimizing performance and reliability:

- 6:1 gear ratio for balanced torque and speed
- CAD-modeled base with integrated motor mounts
- Laser-cut precision components
- 3D-printed custom parts
- Comprehensive frame design for electrical components

![Maze Bot Gear Ratio](/images/project/MazeBotGearRatio.png)

## Software Development

Our software stack leverages modern robotics frameworks and algorithms:

- ROS 2 Humble for message passing and visualization
- Git for version control
- Fast-Marching Trees for path generation
- Bezier Curves for smooth trajectory planning
- TOPPRA for optimal path parameterization

![Kinematics Profiles](/images/project/KinematicsProfilesMazeBot.png)

## Advanced Technologies

The project incorporates cutting-edge technologies:

- RPLidar A1 for environment mapping
- Jetson Nano running Linux 18.04
- Real-time data analysis
- Autonomous decision-making capabilities
- Dynamic environment adaptation

![LiDAR Mapping](/images/project/LiDARMappingMazeBot.png)

## Future Enhancements

Planned improvements include:

- Advanced control software development
- Enhanced LiDAR integration
- Improved localization techniques
- Full autonomous navigation capabilities
- Multi-sensor fusion implementation 