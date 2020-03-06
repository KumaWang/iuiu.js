IUIU.Trigger.bind("Action", "日志{String}", function(value) {
    alert(value);
});

IUIU.Trigger.bind("Number", "{Number}x{Number}", function(value) {});
IUIU.Trigger.bind("Number", "最后一个生成的随机数", function(value) {});
IUIU.Trigger.bind("Number", "随机质数", function(value) {});

IUIU.Trigger.bind("Action", "最终伤害为{Number}", function(value) {});