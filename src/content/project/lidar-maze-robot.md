---
title: "LiDAR Driven Maze Robot"
date: "2023-01"
status: "completed"
image: "/images/project/MazeBotModel.png"
description: "An advanced robotic system capable of autonomously navigating complex mazes using LiDAR technology and sophisticated control algorithms."
tags: ["robotics", "LiDAR", "autonomous systems", "ROS", "Python", "C++"]
---

The **LiDAR Driven Maze Bot** project was an ambitious initiative led by the Texas A&M University Robotics team. This project aimed to develop an advanced robotic system capable of autonomously navigating complex mazes by integrating state-of-the-art LiDAR technology and sophisticated control algorithms. The challenge was to optimize both the mechanical and software aspects while maintaining cost efficiency.

![Maze Bot Model](@images/project/MazeBotModel.png)

## Hardware Enhancements

At the heart of the robot's movement system was a carefully selected combination of high-performance motors and precision encoders. To ensure reliable navigation, we incorporated **high-torque 750Kv motors**, which provided enhanced rotational force essential for maneuverability. The addition of **8192 CPR encoders** allowed for precise position tracking, ensuring that the bot could accurately measure and adjust its movements.

![Maze Bot Gear Ratio](@images/project/MazeBotGearRatio.png)

For motor control, we implemented the **ODrive 3.6 motor controller**, which enabled dynamic velocity profiling, ensuring smooth and efficient motion. Stability was further reinforced with a **DC voltage step-down converter**, guaranteeing a steady power supply to critical components. To enhance communication and connectivity, the **Jetson WiFi Module** was integrated, facilitating seamless data transfer between the onboard computing system and external monitoring interfaces.


![Kinematics Profiles](@images/project/KinematicsProfilesMazeBot.png)

## Mechanical Design and Fabrication

The mechanical design of the robot was engineered to balance performance and reliability. We designed a **6:1 gear ratio**, ensuring an optimal balance between torque and speed, crucial for precise navigation through the maze. The entire base of the robot was **CAD-modeled**, integrating motor mounts that streamlined assembly and improved structural integrity.

Fabrication involved a combination of **laser-cut precision components** for high accuracy and **3D-printed custom parts**, allowing for flexible modifications and design iterations. The frame was meticulously designed to house all electrical components securely, ensuring durability and ease of maintenance.

## Software Development

On the software side, the project leveraged modern robotics frameworks and advanced algorithms to achieve seamless autonomous navigation. **ROS 2 Humble** served as the core framework for message passing and visualization, ensuring real-time data communication between sensors, controllers, and decision-making algorithms.

Path planning was enhanced using **Fast-Marching Trees**, an efficient algorithm for generating feasible navigation paths within complex environments. To ensure smooth trajectory execution, **Bezier Curves** were employed for generating continuous, obstacle-free motion paths. Additionally, **TOPPRA (Time-Optimal Path Parameterization)** was integrated to fine-tune movement speed, ensuring optimal performance in dynamic conditions.

## Advanced Technologies

The robot's perception system relied on the **RPLidar A1**, a cost-effective yet powerful LiDAR sensor used for environment mapping. Running on a **Jetson Nano** with **Linux 18.04**, the system was capable of real-time data analysis and autonomous decision-making. The integration of these components allowed the robot to dynamically adapt to its environment, making intelligent navigation decisions without human intervention.

![LiDAR Mapping](@images/project/LiDARMappingMazeBot.png)

## Future Enhancements

While the project successfully achieved its goal of autonomous maze navigation, several improvements are planned for future iterations. Enhancements in control software will refine navigation precision, while a deeper **LiDAR integration** will improve environmental perception. Advanced **localization techniques**, including multi-sensor fusion, will further increase accuracy. Ultimately, the goal is to achieve **fully autonomous navigation**, enabling the robot to operate seamlessly in even more complex and dynamic environments.

The **LiDAR Driven Maze Bot** is a testament to the potential of robotics in real-world navigation challenges. With ongoing improvements, it stands to become an even more capable autonomous system, pushing the boundaries of robotic intelligence and control.

---