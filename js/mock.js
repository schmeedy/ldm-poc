var mock = {
    ldm: {
        model: {
            datasets: [
                {
                    id: "dataset.person",
                    title: "Person",
                    type: "dataset",
                    attributes: [
                    ],
                    facts: [
                    ],
                    references: [
                        "dataset.department",
                        "date.born"
                    ]
                },
                {
                    id: "dataset.department",
                    title: "Department",
                    type: "dataset",
                    attributes: [
                        {
                            id: "attr.department.id",
                            title: "Department ID",
                            connectionPoint: true,
                            labels: [
                                {id: 'label.department.name',
                                    title: "department name"
                                },
                                {id: 'label.department.code',
                                    title: "department code"
                                }
                            ]
                        },
                        {
                            id: "attr.car.id",
                            title: "Car",
                            connectionPoint: false
                        },
                        {
                            id: "attr.town.id",
                            title: "Town ID",
                            labels: [
                                {id: 'label.town.psc',
                                    title: "town psc"
                                }
                            ]
                        }
                    ],
                    facts: [
                    ],
                    references: [
                    ]
                },
                {
                    id: "date.born",
                    title: "Born (Date)",
                    type: "date-dimension"
                },
                {
                    id: "dataset.transaction",
                    title: "Transaction",
                    type: "dataset"
                }
            ]
        },

        links: {
            project: "/gdc/projects/zgfs16g7iy7hkyeu0kkphblqfynjznw4"
        },
        projectMeta: {
            created: "2013-04-18 16:59:43",
            updated: "2013-04-18 16:59:43",
            author: "/gdc/account/profile/876ec68f5630b38de65852ed5d6236ff",
            contributor: "/gdc/account/profile/876ec68f5630b38de65852ed5d6236ff",
            summary: "",
            title: "test"
        }
    }
};