const triangle = [
  3, 79, 154, 230, 306, 382, 457, 533, 609, 684, 760, 836, 911, 987, 1063, 1139, 1214, 1290, 1366,
  1441, 1517, 1593, 1668, 1744, 1820, 1895, 1971, 2047, 2123, 2198, 2274, 2350, 2425, 2501, 2577,
  2652, 2728, 2804, 2879, 2955, 3031, 3107, 3182, 3258, 3334, 3409, 3485, 3561, 3636, 3712, 3788,
  3864, 3939, 4015, 4091, 4025, 3949, 3873, 3798, 3722, 3646, 3571, 3495, 3419, 3343, 3268, 3192,
  3116, 3041, 2965, 2889, 2814, 2738, 2662, 2587, 2511, 2435, 2359, 2284, 2208, 2132, 2057, 1981,
  1905, 1830, 1754, 1678, 1602, 1527, 1451, 1375, 1300, 1224, 1148, 1073, 997, 921, 846, 770, 694,
  618, 543, 467, 391, 316, 240, 164, 89, 13, 62, 137, 213, 289, 365, 440, 516, 592, 667, 743, 819,
  894, 970, 1046, 1122, 1197, 1273, 1349, 1424, 1500, 1576, 1651, 1727, 1803, 1878, 1954, 2030,
  2106, 2181, 2257, 2333, 2408, 2484, 2560, 2635, 2711, 2787, 2862, 2938, 3014, 3090, 3165, 3241,
  3317, 3392, 3468, 3544, 3619, 3695, 3771, 3847, 3922, 3998, 4074, 4042, 3966, 3890, 3815, 3739,
  3663, 3588, 3512, 3436, 3360, 3285, 3209, 3133, 3058, 2982, 2906, 2831, 2755, 2679, 2604, 2528,
  2452, 2376, 2301, 2225, 2149, 2074, 1998, 1922, 1847, 1771, 1695, 1619, 1544, 1468, 1392, 1317,
  1241, 1165, 1090, 1014, 938, 863, 787, 711, 635, 560, 484, 408, 333, 257, 181, 106, 30, 45, 120,
  196, 272, 348, 423, 499, 575, 650, 726, 802, 877, 953, 1029, 1104, 1180, 1256, 1332, 1407, 1483,
  1559, 1634, 1710, 1786, 1861, 1937, 2013, 2089, 2164, 2240, 2316, 2391, 2467, 2543, 2618, 2694,
  2770, 2845, 2921, 2997, 3073, 3148, 3224, 3300, 3375, 3451, 3527, 3602, 3678, 3754, 3829, 3905,
  3981, 4057, 4059, 3983, 3907, 3832, 3756, 3680, 3605, 3529, 3453, 3377, 3302, 3226, 3150, 3075,
  2999, 2923, 2848, 2772, 2696, 2621, 2545, 2469, 2393, 2318, 2242, 2166, 2091, 2015, 1939, 1864,
  1788, 1712, 1637, 1561, 1485, 1409, 1334, 1258, 1182, 1107, 1031, 955, 880, 804, 728, 652, 577,
  501, 425, 350, 274, 198, 123, 47, 28, 103, 179, 255, 331, 406, 482, 558, 633, 709, 785, 860, 936,
  1012, 1087, 1163, 1239, 1315, 1390, 1466, 1542, 1617, 1693, 1769, 1844, 1920, 1996, 2072, 2147,
  2223, 2299, 2374, 2450, 2526, 2601, 2677, 2753, 2828, 2904, 2980, 3056, 3131, 3207, 3283, 3358,
  3434, 3510, 3585, 3661, 3737, 3812, 3888, 3964, 4040, 4076, 4000, 3924, 3849, 3773, 3697, 3622,
  3546, 3470, 3394, 3319, 3243, 3167, 3092, 3016, 2940, 2865, 2789, 2713, 2638, 2562, 2486, 2410,
  2335, 2259, 2183, 2108, 2032, 1956, 1881, 1805, 1729, 1654, 1578, 1502, 1426, 1351, 1275, 1199,
  1124, 1048, 972, 897, 821, 745, 669, 594, 518, 442, 367, 291, 215, 140, 64, 11, 86, 162, 238, 314,
  389, 465, 541, 616, 692, 768, 843, 919, 995, 1070, 1146, 1222, 1298, 1373, 1449, 1525, 1600, 1676,
  1752, 1827, 1903, 1979, 2054, 2130, 2206, 2282, 2357, 2433, 2509, 2584, 2660, 2736, 2811, 2887,
  2963, 3039, 3114, 3190, 3266, 3341, 3417, 3493, 3568, 3644, 3720, 3795, 3871, 3947, 4023, 4093,
  4017, 3941, 3866, 3790, 3714, 3639, 3563, 3487, 3412, 3336, 3260, 3184,
]
