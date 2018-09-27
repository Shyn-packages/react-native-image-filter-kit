namespace FilterConstructor


module FilterColorArrayInput =


  type Model = FilterArrayInput.Model<FilterColorInput.Model, FilterColorInput.Message>

  type Message = FilterArrayInput.Message<FilterColorInput.Message>

  let init name inputs defaultValue =
    FilterArrayInput.init
      (fun inputName -> FilterColorInput.init inputName defaultValue)
      FilterColorInput.update
      FilterColorInput.view
      name
      inputs
