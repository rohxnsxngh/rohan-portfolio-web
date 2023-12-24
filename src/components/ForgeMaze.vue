<template>
    <div class="flex sm:flex-row flex-col sm:p-8 md:p-4 p-2 space-y-2">
      <div class="lg:h-48 sm:h-32 h-20 flex flex-col mb-8">
        <h1 class="font-bold lg:text-4xl sm:text-4xl text-xl">
          LiDAR Maze Robot.
        </h1>
        <p class="font-bold lg:text-2xl sm:text-2xl text-lg text-primary">
          Texas A&M University Robotics.
        </p>
        <p class="font-bold lg:text-xl sm:text-md text-xs text-slate-500">
          August 2022 - May 2023.
        </p>
        <button
          class="my-2 btn btn-xs sm:btn-sm text-black bg-white border-2 border-primary hover:text-white hover:border-primary w-1/2"
          onclick="maze_project.showModal()"
        >
          Learn More
        </button>
        <dialog id="maze_project" class="modal">
        <div class="modal-box w-11/12 max-w-5xl bg-primary-content">
          <div>
            <h1 class="font-bold text-xl text-primary">
              LiDAR Driven Maze Robot
              <div class="divider"></div>
              <p class="font-normal text-sm text-white">
                In the pursuit of understanding autonomous robotics, the Texas A&M University Robotics team, under my leadership, undertook a comprehensive project named "Maze Bot." This initiative aimed to develop a sophisticated robotic system capable of navigating intricate mazes through the integration of advanced mechanical and software engineering techniques.
The team, consisting of Christian Flewelling, Vincent Galvan, Garrett Adams, and Anna Font, initiated the project by upgrading the Maze Bot's hardware components. Notable improvements included the integration of high torque 750Kv motors, which bolstered the robot's rotational force for enhanced maneuverability in intricate mazes. The adoption of 8192 CPR encoders provided precise position tracking, essential for navigating predefined paths with accuracy. ODrive 3.6 for motor control introduced dynamic velocity profiles, optimizing the robot's speed based on navigational demands. A DC voltage step-down converter ensured stable power distribution, contributing to overall operational robustness. The incorporation of a Jetson WiFi module elevated communication capabilities, enabling seamless data exchange and potential collaboration with external systems. These hardware improvements collectively fortified the Maze Bot, equipping it with advanced mechanical capabilities tailored to address the challenges of maze navigation with efficiency and precision.
Concurrently, the Software Team embarked on a comprehensive exploration of algorithms designed to empower the Maze Bot's adept navigation through the intricate labyrinth. In addressing subproblems, particularly scenarios where the entire maze was known, the team ingeniously employed fast-marching trees to generate intricate piecewise linear paths. Building upon this foundation, Bezier curves were intricately integrated into the paths, each composed of four meticulously chosen control points. This approach was meticulously crafted to seamlessly navigate the complexities of the maze's free space, ensuring an optimal and graceful traversal.
The software's ambit extended beyond the confines of known mazes, envisioning a future where iterative solutions would dynamically unfold in partially known environments. The team's commitment to trajectory planning was exemplified in the meticulous generation of position, velocity, and acceleration profiles using toppra, showcasing their dedication to achieving a smooth and controlled traversal through varying terrains.
 
In an effort to augment the Maze Bot's capabilities, advanced technologies such as Lidar and the Jetson nano running Jetson Linux 18.04 were harnessed. The software team strategically leveraged Lidar's sensing capabilities, notably the RPLidar A1, to enhance the robot's perception and mapping of its surroundings. This cutting-edge integration not only elevated the Maze Bot's localization precision but also underscored the team's commitment to harnessing state-of-the-art technologies for optimal performance.

          <div class="modal-action h-6">
            <form method="dialog">
              <!-- if there is a button, it will close the modal -->
              <button class="my-2 btn btn-xs sm:btn-sm text-black bg-white border-2 border-primary hover:text-white hover:border-primary">Close</button>
            </form>
          </div>
              </p>
            </h1>
          </div>
        </div>
      </dialog>
      </div>
      <div class="px-2">
        <div
          class="carousel carousel-center max-w-xl bg-neutral rounded-box sm:h-1/2 h-80"
        >
        <div class="carousel-item">
            <img src="/Images/MazeBotModel.png" class="rounded-box object-scale-down" id="item1-maze"/>
          </div>
          <div class="carousel-item">
            <img src="/Images/LiDARMappingMazeBot.png" class="rounded-box object-scale-down" id="item2-maze"/>
          </div>
          <div class="carousel-item">
            <img src="/Images/KinematicsProfilesMazeBot.png" class="rounded-box object-scale-down" id="item3-maze"/>
          </div>
        </div>
        <div class="w-full justify-center flex text-xs px-2 h-2 gap-1">
        <a
          href="#item1-maze"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#item2-maze"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#item3-maze"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
      </div>
      </div>
    </div>
  </template>
  