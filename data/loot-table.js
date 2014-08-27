define(
[],
function () {
	function _buildTable(tableData) {
		var table = {};
		table.rawData = tableData;
		table.pool = [];
		
		// Add possible drops to the pool.
		for (var item in tableData) {
			for (var lcv = 0; lcv < tableData[item]; lcv++) {
				table.pool.push(item);
			}
		}
		
		table.getRandom = function() {
			return table.pool[Math.floor(Math.random() * table.pool.length)];
		};
		
		return table;
	}
	
	return {
		"Basic Creature": _buildTable({
			"Sword": 20,
			"Hot Feet": 20,
			"Leather Tunic": 20,
			"Gohan's Hat": 20
		})
	};
});