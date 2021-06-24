const lowpass3 = [
  115590, 97020, 74880, 66345, 58440, 49665, 44670, 51540, 69525, 80730, 81405, 60945, 53970, 48075,
  61650, 63900, 70365, 76755, 86940, 87660, 66540, 50520, 37215, 68505, 91305, 112365, 84030, 59205,
  51510, 85095, 112275, 93045, 49725, 10830, 59580, 128880, 183720, 136890, 46095, -33375, -975,
  94815, 179760, 192345, 111585, 47670, 23265, 53460, 76650, 91560, 90765, 110925, 116655, 97425,
  65250, 36120, 47400, 81570, 107865, 100905, 72840, 58110, 75960, 99645, 92715, 53985, 25725,
  39660, 93795, 133215, 126525, 66720, 10935, 3570, 58740, 118260, 137205, 101370, 49140, 36855,
  45915, 73890, 79320, 82590, 77430, 87225, 83610, 76320, 55935, 43590, 63840, 81540, 96900, 75705,
  68730, 67200, 93765, 85860, 65325, 33870, 32820, 78900, 123630, 142935, 85410, 26580, -10920,
  40995, 99495, 140415, 115005, 64935, 35850, 38850, 72840, 82215, 88545, 64020, 79185, 80175,
  89985, 69720, 52650, 52890, 68100, 88050, 80655, 79005, 65235, 87945, 81930, 75585, 40815, 33870,
  62115, 112470, 140415, 104145, 44250, -8550, 24195, 80865, 140670, 126510, 81150, 34455, 32925,
  62355, 86370, 93810, 67935, 68880, 75255, 95295, 83715, 63960, 43590, 55275, 74055, 83400, 87450,
  77640, 82065, 79965, 73500, 48735, 35115, 48015, 99165, 136680, 122505, 62940, 5745, 8730, 62730,
  121935, 135825, 95910, 43395, 27060, 54030, 91395, 96060, 73725, 56475, 68490, 87825, 97605,
  77160, 53820, 43545, 60315, 80655, 93720, 88785, 75825, 78915, 68250, 58005, 36825, 49050, 83625,
  130560, 126225, 81720, 22260, -1035, 45270, 103140, 142995, 108750, 60405, 21135, 47565, 79545,
  99465, 79830, 53220, 59535, 79035, 110595, 91095, 68580, 33135, 47100, 66690, 97770, 98385, 86070,
  77865, 65190, 61995, 39255, 50055, 66015, 118590, 123315, 100365, 40530, 7110, 28980, 84690,
  135225, 119310, 76080, 21645, 41775, 69945, 104265, 86490, 59070, 48375, 68655, 103620, 105075,
  84810, 34890, 34620, 52710, 99585, 106020, 98040, 76680, 63765, 55380, 42885, 51450, 64170,
  104370, 119055, 111780, 59295, 17565, 14175, 66840, 121245, 127725, 90075, 39165, 35925, 62475,
  97590, 93915, 64950, 38535, 56220, 95625, 118815, 98475, 48285, 23460, 39165, 80895, 111345,
  108645, 84885, 62730, 51000, 51030, 53460, 65190, 86655, 108720, 102885, 73845, 33420, 24195,
  48570, 88275, 102195, 85290, 55665, 39900, 54990, 70920, 78405, 62055, 48930, 48465, 69075, 82155,
  77565, 57675, 39210, 43305, 56835, 75795, 76080, 70515, 56790, 52275, 50520, 54225, 57270, 61275,
  67710, 67635, 64425, 51975, 47970, 49635, 60750, 65760, 65235, 57540, 51945, 53730, 57870, 62685,
  57840, 53700, 50865, 57510, 62175, 63420, 57615, 51135, 49605, 53145, 59730, 61830, 60675, 55305,
  53865, 52815, 54960, 55680, 56595, 57795, 58320, 57600, 54660, 53220, 52560, 55380, 57000, 58425,
  56325, 54480, 54075, 55545, 56385, 55920, 54780, 53640, 54825, 56310, 57120, 55725, 53940, 52515,
  53625, 55665, 56850, 56745, 55410, 54090, 53685, 54255, 54570, 55260, 55410, 55185, 55245, 55200,
  54900, 54450, 54645, 54495, 54540, 54360, 54120, 54105, 54105, 54105, 54105, 54105, 54105, 54105,
  54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105,
  54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105,
  54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105,
  54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105,
  54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105,
  54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105, 54105,
]