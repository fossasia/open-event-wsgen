const assert = require('assert');
const fold = require('../src/backend/fold_v2');

describe('fold_v2.foldBySpeakers', function() {
  it('includes speakers even if they have no sessions', function(done) {
    const sessions = [
      {
        id: 1,
        state: 'accepted',
        title: 'Talk 1',
        'starts-at': '2025-11-13T10:00:00Z',
        'ends-at': '2025-11-13T11:00:00Z',
        track: null,
        microlocation: null
      }
    ];

    const speakers = [
      {
        id: 1,
        name: 'Alice',
        sessions: [{ id: 1 }],
        'photo-url': null,
        'short-biography': '',
        'long-biography': ''
      },
      {
        id: 2,
        name: 'Bob',
        sessions: [],
        'photo-url': null,
        'short-biography': '',
        'long-biography': ''
      }
    ];

    const tracksData = [];

    const reqOpts = {
      assetmode: 'download',
      email: 'test@example.com',
      name: 'Test Event',
      datasource: 'mockjson',
      apiendpoint: ''
    };

    fold.foldBySpeakers(speakers, sessions, tracksData, reqOpts, (list) => {
      try {
        assert.strictEqual(list.length, 2, 'Expected two speakers in the list');
        const bob = list.find(s => s.name === 'Bob');
        assert.ok(bob, 'Bob should be present');
        assert.deepStrictEqual(bob.sessions, [], 'Bob should have empty sessions array');
        done();
      } catch (err) {
        done(err);
      }
    });
  });
});
