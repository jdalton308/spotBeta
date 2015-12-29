
app.factory('GradeRef', [ function() {

	var ref = {
		type: {
			showing: true,
			roped: true,
			subtypes: {
				sport: true,
				trad: true,
				topRope: true,
			},
			boulder: true
		},
		grade: {
			showing: true,
			boulder: {
				showing: true,
				small: {
					0: true,
					1: true,
					2: true,
					3: true,
					4: true,
					5: true,
					6: true,
					7: true,
					8: true,
					9: true
				},
				large: {
					10: true,
					11: true,
					12: true,
					13: true,
					14: true,
					15: true,
					16: true
				}
			},
			roped: {
				showing: true,
				grades: {
					0: {
						grade: 6,
						include: true,
						conversion: 6
					},
					1: {
						grade: 7,
						include: true,
						conversion: 7
					},
					2: {
						grade: 8,
						include: true,
						conversion: 8
					},
					3: {
						grade: 9,
						include: true,
						conversion: 9
					},
					4: {
						grade: '10a',
						include: true,
						conversion: 10.1
					},
					5: {
						grade: '10b',
						include: true,
						conversion: 10.2
					},
					6: {
						grade: '10c',
						include: true,
						conversion: 10.3
					},
					7: {
						grade: '10d',
						include: true,
						conversion: 10.4
					},
					8: {
						grade: '11a',
						include: true,
						conversion: 11.1
					},
					9: {
						grade: '11b',
						include: true,
						conversion: 11.2
					},
					10: {
						grade: '11c',
						include: true,
						conversion: 11.3
					},
					11: {
						grade: '11d',
						include: true,
						conversion: 11.4
					},
					12: {
						grade: '12a',
						include: true,
						conversion: 12.1
					},
					13: {
						grade: '12b',
						include: true,
						conversion: 12.2
					},
					14: {
						grade: '12c',
						include: true,
						conversion: 12.3
					},
					15: {
						grade: '12d',
						include: true,
						conversion: 12.4
					},
					16: {
						grade: '13a',
						include: true,
						conversion: 13.1
					},
					17: {
						grade: '13b',
						include: true,
						conversion: 13.2
					},
					18: {
						grade: '13c',
						include: true,
						conversion: 13.3
					},
					19: {
						grade: '13d',
						include: true,
						conversion: 13.4
					},
					20: {
						grade: '14a',
						include: true,
						conversion: 14.1
					},
					21: {
						grade: '14b',
						include: true,
						conversion: 14.2
					},
					22: {
						grade: '14c',
						include: true,
						conversion: 14.3
					},
					23: {
						grade: '14d',
						include: true,
						conversion: 14.4
					},
					24: {
						grade: '15a',
						include: true,
						conversion: 15.1
					},
					25: {
						grade: '15b',
						include: true,
						conversion: 15.2
					},
					26: {
						grade: '15c',
						include: true,
						conversion: 15.3
					},
					27: {
						grade: '15d',
						include: true,
						conversion: 15.4
					}
				}
			}
		},
		rating: {
			showing: true,
			stars: {
				1: true,
				2: true,
				3: true,
				4: true,
				5: true
			}
		},
		height: {
			showing: true,
			values: {
				0: {
					height: 0,
					units: 'feet',
					included: true
				},
				1: {
					height: 10,
					units: 'feet',
					included: true
				},
				2: {
					height: 15,
					units: 'feet',
					included: true
				},
				3: {
					height: 20,
					units: 'feet',
					included: true
				},
				4: {
					height: 25,
					units: 'feet',
					included: true
				},
				5: {
					height: 30,
					units: 'feet',
					included: true
				},
				6: {
					height: 40,
					units: 'feet',
					included: true
				},
				7: {
					height: 50,
					units: 'feet',
					included: true
				},
				8: {
					height: 60,
					units: 'feet',
					included: true
				},
				9: {
					height: 70,
					units: 'feet',
					included: true
				},
				10: {
					height: 80,
					units: 'feet',
					included: true
				},
				11: {
					height: 90,
					units: 'feet',
					included: true
				},
				12: {
					height: 100,
					units: 'feet',
					included: true
				},
				13: {
					height: 120,
					units: 'feet',
					included: true
				},
				14: {
					height: 140,
					units: 'feet',
					included: true
				},
				15: {
					height: '140+',
					units: 'feet',
					included: true
				}
			}
		}
	};

	return ref;

}]);