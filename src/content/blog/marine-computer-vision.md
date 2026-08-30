---
title: "Computer Vision Challenges Unique to Marine Environments"
date: "2026-08"
author: "Rohan Singh"
image: "@images/experience/octapulse/4DABB450-8CE3-49C1-A66F-495E35A8C055_1_102_o.jpeg"
status: "Complete"
description: "Water is part of the optical path, not the backdrop. What scattering, specularity and a deformable subject actually do to a vision pipeline, measured on our own captures."
tags: ["computer vision", "marine", "robotics", "OctaPulse", "deep learning"]
---

Water is not a place you put a camera. It is part of the optical path, and it sits between the sensor and every photon that reaches it.

I have written before about why measurement rather than decision-making is the bottleneck in aquaculture autonomy. That piece was about the loop. This one is about the medium, because most of what makes marine vision hard has nothing to do with the model and everything to do with what happens to light on the way in.

## What Water Does Before the Sensor Ever Sees It

Turbidity first. Suspended solids, plankton, feed fines, waste. Every particle is a scattering centre, so what degrades with distance is contrast rather than brightness. You can add light and get a brighter image carrying no more information.

Then wavelength-dependent attenuation. Water absorbs unevenly across the spectrum and the long wavelengths go first, so a colour channel that carried signal in air can be close to useless underwater. Any model whose training statistics came from above the surface is quietly invalidated.

Then refraction, at the water boundary and again at the port of a housing, varying with wavelength and with the port geometry, so a calibration done dry does not transfer wet. Then backscatter, the cruel one: an artificial light in turbid water lights the particles between lens and subject before the subject, so turning it up thickens the veil.

And then biofouling, which no optics model covers. A submerged optical surface grows a biological film, so the camera never fails on a particular day. It degrades continuously, and the drift is in your data long before anyone sees it in the images.

I should be exact about where I stand on that list. OctaPulse does not image underwater. We photograph the fish out of the water, on a calibrated mat under an overhead camera, which is why I can list those five effects but have measured none of them. I have written elsewhere about why avoiding the water was a product decision rather than a technical result.

What it leaves behind is the rest of this piece, and it is more than I expected.

## Passive Stereo Returns Almost Nothing on a Wet Fish

A wet fish is a mirror. A curved, moving, specular mirror with a liquid film on it, lying on a surface that is also wet. Specularity is the single optical property that has cost us the most, and it produces failures that look unrelated until you line them up.

We audited 585 captures from an OAK-4-D on 14 July 2026, recomputing everything from the raw 16-bit depth images rather than trusting the on-device numbers.

Valid depth on the fish came out at a median of 13.1 percent, p10 3.2 and p90 22.0, with 364 of the 585 captures under 15 percent dense. Active stereo with an infrared dot projector lands around 80 to 95 percent. We were at 13.

The session also produced exactly one thickness number, 132 mm, for an animal that is 20 to 80 mm thick. That is a separate failure with a separate cause: depth alignment was switched off for all but three of those captures while we chased a firmware crash, so the fish bounding box and the depth map did not index into each other, and for the rest the app correctly refused to emit a number at all.

That is the whole argument in one number. Passive block-matching stereo works by finding the same patch of texture in the left and right image, and a wet, specular fish on a plain stage offers nothing to correlate. What depth comes back clings to the operator's hand and a ring of spilled water, the only textured things in frame.

We tried the obvious escapes. Raising the mono resolution from 640 by 400 to 1280 by 800, chasing disparity precision, halved density: valid depth in the region of interest fell from about 19 percent to about 12. The intuition that more pixels means more texture is backwards in a texture-starved scene: the same weak signal spread over four times the pixels leaves less inside each matching block. The confidence filter was not the culprit either, since our setting of 245 is DepthAI's default and near maximally permissive. The cause is physical, not software.

## One Optical Property, Two Failures That Look Unrelated

Meanwhile, in a different part of the pipeline, our ring light was blowing out the fish. A coaxial ring around the lens gives shadow-free illumination and a clean outline, right up until the subject is wet. Then it reflects straight back into the lens, and the blown highlights eat the fish outline, which is exactly the boundary the segmentation model is asked to find.

Those are plausibly the same problem. We have not run the experiment that proves the link, but specular surfaces defeat correspondence matching the same way they defeat thresholding. One optical property of a wet animal, two failures in subsystems that share no code.

The interim fix is cross-polarisation, a polarising film on the light and a crossed polariser on the lens, costing roughly one and a half to two stops. The structural fix is to abandon the coaxial ring for bar lights at a shallow angle, so the specular lobe never points back at the sensor. Geometry beats post-processing here.

## The Reference Plane Moved More Than the Fish Is Thick

Thickness, when we can compute it at all, is the stage plane minus the fish surface. Across that same session, whole-frame depth had a median of 564 mm, a range of 484 to 796 mm and a standard deviation of 69 mm. A trout in this size class is around 40 mm thick, well inside the 20 to 80 mm range above, so the reference was wandering further between captures than the quantity we were trying to measure.

That 69 mm is the quantitative reason behind something I have described before, the scale fiducial in every frame. A reference plane that moves by more than the subject is thick cannot be trusted to carry scale either, so each image carries its own known-length reference and calibrates itself.

## Noise Became Bias Because We Chose the Wrong Estimator

Given a bounding box that is part fish and part stage showing through around the body, the obvious way to find the fish surface is a low percentile: the nearest decile is the fish top. It is intuitive and it is biased, because a percentile picks the near tail of the noise distribution, so its error grows with the noise instead of averaging out. Measured against a synthetic 40 mm fish at 20 percent depth density, p10 over-reported by 2.6 mm at 2 mm of noise and by 11.6 mm at 10 mm. It inflates every fish, and the inflation looks like a plausible measurement.

The fix is a two-pass median: use a rough percentile only to place a split plane halfway between stage and fish top, then take the median of the pixels on the fish side. The median of symmetric noise is unbiased, so error stays flat: 0.2 mm at 2 to 5 mm of noise, and 1.2 mm at 10. Same data, about ten times less bias.

Water gave us the sparsity and the noise. The estimator turned that noise into a systematic overestimate.

## The Subject Deforms, and Pose Reads as Damage

Everything above assumes the subject is at least rigid. Fish are not.

Our first pass at fin erosion scoring compared each fin's mask area against a population reference. It ran end-to-end on 61 fish, and the dominant signal was pose rather than damage. Caudal area varied between 7 and 12 percent of body area purely from how spread or folded the tail was, and folded pectoral fins read as more than 80 percent eroded.

The rebuild separates the two. Fins are measured in per-fin canonical frames anchored to morphometric keypoints, so a fin is compared in its own normalised coordinate system rather than in pixels. Aligned masks are rasterised into that grid to build a coverage map, and the template is the median envelope rather than an upper percentile, since a p90 reference makes the typical fish look eroded by construction.

A caudal template that resolves into a crisp fork rather than a blur is the evidence that the alignment works, since a misaligned stack would average into a blob. There is a backstop for the confound too: a folded but intact tail still has long rays, so the keypoint fork extent stays high while mask area says eroded, and that disagreement raises a fold flag rather than a score.

## No Ground Truth, So Test Invariances Instead

The hardest part of this domain is not any single physical effect. It is that there is rarely an independent measurement to check against. Nobody is standing beside the tank with a calibrated fin erosion instrument. So we split verification into three questions, and two need no labels at all.

Does the pose normalisation work? Warp a fish, rotate and rescale it, re-run the whole pipeline, and check whether the canonical measures move. Caudal came out at roughly 18 percent coefficient of variation; dorsal height came out at roughly 80 percent, so we dropped the dorsal linear measure from scoring rather than report it.

Does the measure respond to real damage? Synthetically shorten a tail by a known fraction and check the number. The caudal measure reports 15 percent for 15, 30 for 30, 60 for 60.

Do the absolute scores agree with an expert? That one needs a hand-scored calibration set, and it is the one we have not done.

An invariance test and a sensitivity test are not a substitute for agreement with a human. They are the two checks you can run before you have a single label, and they caught a measure that was mostly noise.

The same caution applies upstream of the camera. A spreadsheet column we were handed, labelled Image Number, turned out to hold the fish weight in grams, matching the weights sheet exactly on 385 of 400 rows. With no ground truth, a column heading is a hypothesis.

## The Environment Moves Too

Detection on that rig collapsed once. Trout box width as a fraction of frame width told the story: the training set sat at a median of 0.26 while the current frame was 0.56, and at 0.39 the model scored 0.03 where at the training median it scored 0.44. The camera had ended up roughly 1.6 times closer than when the data was collected, and the background had changed from a white tub to a grey metallic surface with specular glare. The same frame failed on the same weights inside a separate codebase, which ruled out the camera, the deploy and everything else downstream: it was a model and data problem. The weights were fine on the data they were trained on. The world had moved out from under them in two dimensions at once, scale and surface. The remedy was retraining on roughly 500 frames from the current view.

The instinct in a wet environment is to seal everything, and that is wrong too. A sealed box that keeps water out also traps water in, which is why the food industry doctrine is drainable rather than sealed.

Almost nothing here was a modelling problem. It was a specular surface, a moving reference plane, a biased estimator, a deformable subject and a rig that got moved. Water is not the backdrop to the computer vision problem in this industry. Most weeks, it is the computer vision problem.
