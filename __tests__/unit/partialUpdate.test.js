const sqlForPartialUpdate = require("../../helpers/partialUpdate")

describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",function() {
    let updateGoogle = sqlForPartialUpdate(
      'companies',
      {name: 'Google', num_employees: 50},
      'handle',
      'Google');
    expect(updateGoogle).toEqual({
      query: `UPDATE companies SET name=$1, num_employees=$2 WHERE handle=$3 RETURNING *`,
      values: ['Google', 50, 'Google']
    });
    
    let updateFacebook = sqlForPartialUpdate(
      'companies',
      {name: 'Facebook', description: 'evil data goliath'},
      'handle',
      'FB')
    expect (updateFacebook).toEqual({
      query: `UPDATE companies SET name=$1, description=$2 WHERE handle=$3 RETURNING *`,
      values: ['Facebook', 'evil data goliath', 'FB']
    });
  }
  );
});

/** table: where to make the query
 * - items: an object with keys of columns you want to update and values with
 *          updated values
 * - key: the column that we query by (e.g. username, handle, id)
 * - id: current record ID
 */