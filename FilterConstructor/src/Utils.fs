namespace FilterConstructor

open Elmish
open Fable.PowerPack
open Fable.Import

module Utils =

  let average min max =
    (min + max) / 2.

  let rec moveDownAt index list =
    match index, list with
    | -1, _ -> list
    | 0, first::second::tail -> second::first::tail
    | index, first::tail -> first::moveDownAt (index - 1) tail
    | _, [] -> list

  let moveUpAt index list = moveDownAt (index - 1) list

  let configureNextLayoutAnimation () =
    ()
    // Globals.LayoutAnimation.spring id

  let delayCmd ms message =
    Cmd.ofPromise Promise.sleep ms (fun _ -> message) (fun _ -> message)

  let invariant x msg =
    if not x then
      let error = sprintf "Contract violation: %s" msg
      Browser.console.log(error)
      failwith error
